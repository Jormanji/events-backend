const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const eventRoutes = require('./routes/eventRoutes');
const authRoutes = require('./routes/authRoutes');
const protectedRouter = require('./routes/protectedRoute');
const googleRoutes = require('./routes/googleRoutes');
const session = require('express-session');
const app = express();


// Middleware
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true, 
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

  app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: 'lax'
    }
  }));
  

// Save user ID in session upon login
app.use((req, res, next) => {
  if (req.session.userId) {
    console.log(`Authenticated user ID: ${req.session.userId}`);
  }
  next();
});

// Register the event routes and auth routes
app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', protectedRouter);
app.use('/', googleRoutes);
app.use('/auth', authRoutes);

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
