export default function range(max: number, contents = ''): string[] {
  return Array.from({ length: max }).fill(contents);
}
