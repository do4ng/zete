export function existsPackage(packageName: string) {
  try {
    require(packageName);
    return true;
  } catch (e) {
    return false;
  }
}
