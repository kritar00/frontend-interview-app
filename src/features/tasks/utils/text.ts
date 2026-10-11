const AVATAR_COLORS = [
  '#1677ff',
  '#52c41a',
  '#722ed1',
  '#fa8c16',
  '#13c2c2',
  '#eb2f96',
] as const

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.charAt(0) ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : ''
  return `${first}${last}`.toUpperCase() || '?'
}

export function colorFromString(value: string): string {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 100_000
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length] ?? '#1677ff'
}
