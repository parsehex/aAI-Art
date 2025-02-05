export function parseColor(color: string): number {
  if (color.startsWith('#')) {
    return parseInt(color.replace('#', '0x'))
  }
  const colorMap: Record<string, number> = {
    red: 0xff0000,
    green: 0x00ff00,
    blue: 0x0000ff,
    white: 0xffffff,
    black: 0x000000,
    yellow: 0xffff00,
    transparent: 0x000000,
  }
  return colorMap[color.toLowerCase()] || 0xffffff
}
