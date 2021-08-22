#!/usr/bin/env node
const path = require('path');
const express = require('express');
const router = require('./router');

module.exports = function(app) {
  // 生成器静态文件目录
  app.use('/ra-gen/', express.static(path.join(__dirname, 'public')));

  // 生成器首页路由
  app.get('/dev-ra-gen', function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  router.forEach(item => app.use('/api/ra-gen', item));
};
