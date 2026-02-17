export async function packageIsInstalled(pkg: string) {
  try {
    await import(pkg)
    return true
  }
  catch {
    return false
  }
}
