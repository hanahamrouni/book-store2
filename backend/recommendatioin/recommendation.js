// routes/recommendations.js
const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationsController');

// GET /api/recommendations
router.get('/', getRecommendations);

module.exports = router;