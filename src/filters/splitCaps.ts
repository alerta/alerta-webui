export default function (value) {
  if (value == null) return ''
  return value
    .toString()
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}
