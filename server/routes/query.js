// query.js
const router = require('express').Router();
const auth   = require('../middleware/authMiddleware');
const { handleStream } = require('../controllers/queryController');
router.get('/stream', auth, handleStream); // GET so EventSource works
module.exports = router;