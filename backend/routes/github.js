const express = require('express');
const router = express.Router();

const { uploader } = require('../controllers/uploader');

// define route relative to mount point; server will mount this router at '/api'
router.post('/link', uploader);

module.exports = router;