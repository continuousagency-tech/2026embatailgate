// Natural sort for class labels like "LA 3", "LA 28", "SD 2", "MBA 2025".
export function classSortKey(label) {
  const match = String(label).match(/^(.*?)(\d+)\s*$/);
  if (match) {
    return [match[1].trim(), parseInt(match[2], 10)];
  }
  return [label, 0];
}

export function compareClasses(a, b) {
  const [aPrefix, aNum] = classSortKey(a);
  const [bPrefix, bNum] = classSortKey(b);
  if (aPrefix !== bPrefix) return aPrefix.localeCompare(bPrefix);
  return aNum - bNum;
}
