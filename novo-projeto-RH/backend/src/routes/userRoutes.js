const express = require('express');
const router = express.Router();

// Placeholder routes for development
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Users endpoint',
    data: [],
  });
});

module.exports = router;