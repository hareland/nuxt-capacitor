import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  findConflictingConfigFiles,
  renderCapacitorConfig,
  resolveConfigFileName,
  writeCapacitorConfig,
} from '../layer/utils/capacitor'

const config = { appId: 'com.example.app', appName: 'App', webDir: '.output/public' }

describe('resolveConfigFileName', () => {
  it.each(['json', 'ts', 'js', 'mjs'] as const)('maps %s', (output) => {
    expect(resolveConfigFileName(output)).toBe(`capacitor.config.${output}`)
  })

  it('throws on unknown output', () => {
    expect(() => resolveConfigFileName('yaml' as never)).toThrow(/Unknown/)
  })
})

describe('renderCapacitorConfig', () => {
  it('renders valid json', () => {
    expect(JSON.parse(renderCapacitorConfig('json', config))).toEqual(config)
  })

  it.each(['ts', 'js', 'mjs'] as const)('renders a self-contained %s module', (output) => {
    const out = renderCapacitorConfig(output, config)
    expect(out).toContain('export default config')
    expect(out).toContain('"appId": "com.example.app"')
    expect(out).not.toContain('.nuxt')
  })
})

describe('writeCapacitorConfig', () => {
  it('writes the file and reports conflicting formats', () => {
    const dir = mkdtempSync(join(tmpdir(), 'nuxt-capacitor-'))
    writeFileSync(join(dir, 'capacitor.config.json'), '{}')
    const file = writeCapacitorConfig(dir, 'ts', config)
    expect(file).toBe(join(dir, 'capacitor.config.ts'))
    expect(findConflictingConfigFiles(dir, 'ts')).toEqual(['capacitor.config.json'])
  })
})
