const express = require('express');
const router = express.Router();

// 获取项目目录结构
router.get('/dirs', (req, res) => {
  res.send('dirs');
});

module.exports = router;
