export function lowestPrice(priceLabel) {
  const matches = String(priceLabel).match(/\d+(?:\.\d+)?/g) || []
  return matches.length ? Number(matches[0]) : 0
}
