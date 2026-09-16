import Offer from './models/Offer.js'

const offers = [
  { code: 'SAVE100', title: 'Flat ₹100 OFF', description: 'Save ₹100 on orders above ₹799', type: 'flat', value: 100, minOrder: 799 },
  { code: 'RDX15', title: '15% OFF', description: 'Save 15% up to ₹120 on orders above ₹599', type: 'percent', value: 15, maxDiscount: 120, minOrder: 599 },
  { code: 'MEGA200', title: 'Flat ₹200 OFF', description: 'Save ₹200 on orders above ₹1,299', type: 'flat', value: 200, minOrder: 1299 },
]

export async function seedOffersIfEmpty() {
  for (const offer of offers) {
    await Offer.findOneAndUpdate({ code: offer.code }, { $setOnInsert: offer }, { upsert: true, new: true, setDefaultsOnInsert: true })
  }
  return offers.length
}

if (process.argv[1]?.endsWith('seedOffers.js')) {
  const { default: mongoose } = await import('mongoose')
  const { default: dotenv } = await import('dotenv')
  dotenv.config()
  process.env.MONGODB_URI ||= 'mongodb://127.0.0.1:27017/rdx_fast_food'
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log(`Seeded ${await seedOffersIfEmpty()} offers`)
  } finally {
    await mongoose.disconnect()
  }
}
