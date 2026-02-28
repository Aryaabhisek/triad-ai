const Query = require('../models/Query');

exports.getHistory = async (req, res) => {
  try {
    const queries = await Query.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('query createdAt responses');
    res.json(queries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteHistory = async (req, res) => {
  try {
    await Query.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};