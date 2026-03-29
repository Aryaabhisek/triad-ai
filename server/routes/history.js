// history.js
const router = require('express').Router();
const auth   = require('../middleware/authMiddleware');
const { getHistory, deleteHistory } = require('../controllers/historyController');
router.get('/',        auth, getHistory);
router.delete('/:id',  auth, deleteHistory);
module.exports = router;