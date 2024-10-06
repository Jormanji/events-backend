const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, (req, res) => {
  console.log('Accessing protected route with user:', req.user);
  res.json({ message: 'Access granted' });
});

router.get('/protected', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Access granted' });
});

module.exports = router;
