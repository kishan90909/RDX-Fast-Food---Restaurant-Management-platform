import MenuItem from '../models/MenuItem.js'
import { defaultMenuData } from '../seedMenuData.js'
import { lowestPrice } from '../utils/parsePrice.js'

function dietType(name, category) {
  const text = `${name} ${category}`.toLowerCase()
  return ['chicken', 'egg', 'non-veg'].some(k => text.includes(k)) ? 'Non-Veg' : 'Veg'
}

export async function seedMenuIfEmpty() {
  if (await MenuItem.exists()) return
  const docs = []
  for (const [category, items] of Object.entries(defaultMenuData)) {
    for (const item of items) {
      docs.push({
        itemId: `${category}::${item.name}`,
        name: item.name,
        category,
        price: lowestPrice(item.price),
        priceLabel: item.price,
        available: item.available !== false,
        bestseller: Boolean(item.bestseller),
        special: Boolean(item.special),
        dietType: dietType(item.name, category)
      })
    }
  }
  await MenuItem.insertMany(docs, { ordered: false })
  console.log(`Seeded ${docs.length} RDX menu items`)
}
