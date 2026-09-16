export function requiredString(name) {
  return (req, res, next) => {
    if (typeof req.body?.[name] !== 'string' || !req.body[name].trim()) {
      return res.status(400).json({ success: false, message: `${name} is required` })
    }
    next()
  }
}

export function customerKey(req, res, next) {
  // Authenticated users always own their persistence key. Never trust a client-supplied
  // customerKey for V2 protected resources. Keep the V1 validation path for public/non-auth
  // resources that still use this middleware.
  if (req.user?.email) {
    req.customerKey = `email:${String(req.user.email).trim().toLowerCase()}`
    return next()
  }
  const key = req.body?.customerKey || req.query?.customerKey || req.params?.customerKey
  if (typeof key !== 'string' || key.trim().length < 3 || key.length > 160) {
    return res.status(400).json({ success: false, message: 'A valid customerKey is required for Version 1 persistence' })
  }
  req.customerKey = key.trim()
  next()
}
