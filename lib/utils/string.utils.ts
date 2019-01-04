export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function camelToKebab(string: string): string {
  return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function removeEnds(string: string, end: string): string {
  if (string.endsWith(end)) {
    return string.substring(0, string.length - end.length);
  }
  return string;
}
