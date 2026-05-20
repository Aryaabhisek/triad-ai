// query.js
const router = require('express').Router();
const auth   = require('../middleware/authMiddleware');
const { handleStream, summarize } = require('../controllers/queryController');

router.get('/stream', auth, handleStream);   // GET so EventSource works
router.post('/summarize', auth, summarize);  // POST for summarization

module.exports = router;