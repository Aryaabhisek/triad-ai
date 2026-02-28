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