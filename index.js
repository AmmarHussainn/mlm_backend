const express = require('express');
const connectDB = require('./db');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

app.use(cors());

// Middleware for parsing JSON
app.use(express.json());

// Routes
const authRoutes = require('./routes/userRoute');
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
