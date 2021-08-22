const express = require('express');
const router = express.Router();

// 获取页面菜单
router.get('/menus', (req, res) => {
  res.send('menus');
});

// 获取当前菜单页面配置
router.get('/menus/page-config', (req, res) => {
  res.send('menus/page-config');
});

// 获取组件库
router.get('/stores', (req, res) => {
  res.send('stores');
});

// 保存页面配置
router.post('/page-config', (req, res) => {
  res.send('page-config');
});

// 组件另存为
router.post('/components', (req, res) => {
  res.send('components');
});

// 源码保存
router.post('/code', (req, res) => {
  res.send('code');
});

module.exports = router;
