const mongoose = require('mongoose');

const QuerySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  query:  { type: String, required: true },
  responses: {
    gemini:  { text: String, latency: Number, done: Boolean },
    groq:    { text: String, latency: Number, done: Boolean },
    mistral: { text: String, latency: Number, done: Boolean },
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Query', QuerySchema);

// client/src/api/axios.js
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;