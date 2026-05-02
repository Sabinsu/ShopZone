// server/controllers/authController.js  ← REPLACE
const asyncHandler = require('express-async-handler')
const { OAuth2Client } = require('google-auth-library')
const User  = require('../models/User')
const { generateToken } = require('../middleware/authMiddleware')

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const sendUser = (res, user, status = 200) => {
  const token = generateToken(user._id)
  res.status(status).json({
    _id:        user._id,
    name:       user.name,
    email:      user.email,
    avatar:     user.avatar,
    role:       user.role,
    phone:      user.phone,
    wishlist:   user.wishlist,
    sellerInfo: user.sellerInfo,
    token,
  })
}

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields are required' })
  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' })

  const exists = await User.findOne({ email })
  if (exists) return res.status(400).json({ message: 'Email already registered' })

  const user = await User.create({ name, email, password })
  sendUser(res, user, 201)
})

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' })

  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Invalid email or password' })

  if (!user.isActive)
    return res.status(403).json({ message: 'Account is deactivated' })

  sendUser(res, user)
})

// POST /api/auth/google
exports.googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body
  if (!credential) return res.status(400).json({ message: 'No Google credential' })

  const ticket  = await googleClient.verifyIdToken({
    idToken:  credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  })
  const payload = ticket.getPayload()
  const { sub: googleId, email, name, picture } = payload

  let user = await User.findOne({ $or: [{ googleId }, { email }] })

  if (!user) {
    user = await User.create({ name, email, googleId, avatar: picture, password: '' })
  } else if (!user.googleId) {
    user.googleId = googleId
    user.avatar   = user.avatar || picture
    await user.save()
  }

  if (!user.isActive)
    return res.status(403).json({ message: 'Account is deactivated' })

  sendUser(res, user)
})

// GET /api/auth/profile  (protected)
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name images price')
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json({
    _id:        user._id,
    name:       user.name,
    email:      user.email,
    avatar:     user.avatar,
    role:       user.role,
    phone:      user.phone,
    wishlist:   user.wishlist,
    sellerInfo: user.sellerInfo,
    notifications: user.notifications?.slice(-20),
    createdAt:  user.createdAt,
  })
})

// PUT /api/auth/profile  (protected)
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body
  const user = await User.findById(req.user._id)
  if (!user) return res.status(404).json({ message: 'User not found' })

  if (name)   user.name   = name
  if (phone)  user.phone  = phone
  if (avatar) user.avatar = avatar

  if (req.body.password) {
    if (req.body.password.length < 6)
      return res.status(400).json({ message: 'Password too short' })
    user.password = req.body.password
  }

  await user.save()
  sendUser(res, user)
})

// POST /api/auth/wishlist/:productId  (protected)
exports.toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  const pid  = req.params.productId
  const idx  = user.wishlist.findIndex(id => id.toString() === pid)

  let added
  if (idx >= 0) {
    user.wishlist.splice(idx, 1)
    added = false
  } else {
    user.wishlist.push(pid)
    added = true
  }

  await user.save()
  res.json({ added, wishlist: user.wishlist })
})

// PUT /api/auth/notifications/read  (protected)
exports.markNotificationsRead = asyncHandler(async (req, res) => {
  await User.updateOne(
    { _id: req.user._id },
    { $set: { 'notifications.$[].read': true } }
  )
  res.json({ message: 'Notifications marked as read' })
})

// POST /api/auth/become-seller  (protected)
exports.becomeSeller = asyncHandler(async (req, res) => {
  const { storeName, description } = req.body
  if (!storeName) return res.status(400).json({ message: 'Store name is required' })

  const user = await User.findById(req.user._id)
  user.role = 'seller'
  user.sellerInfo = {
    storeName,
    description: description || '',
    approved:    false,
    appliedAt:   new Date(),
  }
  await user.save()
  res.json({ message: 'Application submitted', user })
})
