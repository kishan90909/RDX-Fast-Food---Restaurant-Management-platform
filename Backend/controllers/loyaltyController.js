import LoyaltyAccount from '../models/LoyaltyAccount.js'

const normalize = (account) => ({
  points: Number(account?.points || 0),
  lifetimePoints: Number(account?.lifetimePoints || 0),
  redeemedPoints: Number(account?.redeemedPoints || 0),
  history: Array.isArray(account?.history) ? account.history.map(item => ({
    id: item.id,
    type: item.type,
    points: Number(item.points || 0),
    amount: Number(item.amount || 0),
    orderId: item.orderId || '',
    date: item.date || null,
  })) : [],
})

export async function getLoyalty(req, res) {
  const account = await LoyaltyAccount.findOneAndUpdate(
    { userId: req.user._id },
    { $setOnInsert: { userId: req.user._id } },
    { new: true, upsert: true }
  ).lean()
  return res.json({ success: true, loyalty: normalize(account) })
}
