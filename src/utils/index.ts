export * from './color'
export * from './TextureGenerator'

export function copyToClipboard(text: string): boolean {
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'

    document.body.appendChild(textarea)
    textarea.select()

    const success = document.execCommand('copy')
    document.body.removeChild(textarea)

    return success
  } catch (err) {
    console.error('Failed to copy text:', err)
    return false
  }
}
