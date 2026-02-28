const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/query',   require('./routes/query'));
app.use('/api/history', require('./routes/history'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () => 
      console.log(`✅ Server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.error('MongoDB error:', err));