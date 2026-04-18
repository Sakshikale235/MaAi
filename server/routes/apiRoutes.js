const express = require('express');
const router = express.Router();
const { upload, analyzeDocument, analyzeTextDirectly } = require('../controllers/analysisController');

router.post('/analyze', upload.single('image'), analyzeDocument);
router.post('/analyze-text', analyzeTextDirectly);

module.exports = router;
