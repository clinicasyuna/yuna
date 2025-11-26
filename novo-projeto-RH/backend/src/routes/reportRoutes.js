const express = require('express');
const router = express.Router();

// Placeholder routes for development
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Reports endpoint',
    data: [],
  });
});

module.exports = router;