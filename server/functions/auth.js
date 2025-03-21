const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const User = require('../DL/Models/userModel');

async function login(email, password) {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  const passwordMatch = await bcryptjs.compare(password, user.password);
  if (!passwordMatch) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.SECRET_CODE, { expiresIn: '30d' });
  return token;
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.SECRET_CODE, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  });
}



async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.SECRET_CODE)
    const user = await User.findById(decoded.userId)
    return !!user
  } catch (error) {
    return false
  }
}


module.exports = { login, authenticateToken,verifyToken };
