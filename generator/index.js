#!/usr/bin/env node
const path = require('path');
const express = require('express');
require('express-async-errors');
const bodyParser = require('body-parser');
const router = require('./router');

module.exports = function(app, { apiPrefix = '/api' } = {}) {
  // 生成器静态文件目录
  app.use('/ra-gen/', express.static(path.join(__dirname, 'public')));

  // 使用 body-parser 中间
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // 生成器首页路由
  app.get('/dev-ra-gen', function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  router.forEach(item => app.use(apiPrefix + '/ra-gen', item));
};
