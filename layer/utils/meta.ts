import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export async function packageIsInstalled(pkg: string) {
  try {
    await import(pkg)
    return true
  }
  catch {
    return false
  }
}
