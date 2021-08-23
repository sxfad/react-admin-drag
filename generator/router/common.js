const fs = require('fs-extra');
const path = require('path');
const express = require('express');
const router = express.Router();

// 获取项目目录结构
router.get('/dirs', async (req, res) => {
  const cwd = process.cwd();
  const src = path.join(cwd, 'src');

  const dirs = await fs.readdir(src);
  const targetDirs = dirs.filter(it => ['components', 'pages'].includes(it));

  const loop = (parentPath, fileName) => {
    const filePath = path.join(parentPath, fileName);
    const stat = fs.lstatSync(filePath);
    const isDir = stat.isDirectory();
    if (!isDir) return;

    let children;
    const files = fs.readdirSync(filePath);
    if (files && files.length) {
      children = files.map(item => loop(filePath, item)).filter(item => !!item);
    }

    return {
      label: fileName,
      value: filePath,
      disabled: !isDir,
      children,
    };
  };

  const result = targetDirs.map(item => loop(src, item));

  res.send(result);
});

// 创建文件
router.post('/file', async (req, res) => {
  let { dir, filePath, content } = req.body;
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) {
    filePath = filePath + '.jsx';
  }

  const _filePath = path.join(dir, filePath);
  await fs.ensureFile(_filePath);
  await fs.writeFile(_filePath, content, 'UTF-8');

  res.send(true);
});

// 检测文件是否存在
router.get('/check-file', async (req, res) => {
  let { dir, filePath } = req.query;
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) {
    filePath = filePath + '.jsx';
  }

  const result = await fs.pathExists(path.join(dir, filePath));

  res.send(result);
});

module.exports = router;
