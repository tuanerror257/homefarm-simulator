export function formatDate(dateStr: string, includeTime = false) {
  if (includeTime) {
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function formatShort(dateStr: string) {
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}
