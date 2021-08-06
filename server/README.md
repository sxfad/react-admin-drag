# front-center-server

基于 eggjs 的node后端框架

## 快速开始
更多信息请查看 [egg 官方文档][egg]

### 开发

```bash
# 安装依赖
$ npm i --registry https://registry.npm.taobao.org

# 启动后端
$ npm run dev-back

# 浏览器访问
$ open http://localhost:3030/
```

### 发布

```bash
# 安装依赖
$ npm install --production --registry https://registry.npm.taobao.org

# 项目整体打包成 tgz文件，部署时候解压即可

# 启动服务
$ npm start

# 停止服务
$ npm stop

```
注：前端文件有缓存，前端文件更新后，也要重启后端服务。

### 数据库
不需要创建表，开发模式下 通过 `./app.js` 文件，可以进行数据库同步、初始化。

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.

## 资料
- [页面模板 egg-view-ejs](https://github.com/eggjs/egg-view-ejs)
- [数据库 sequelize](https://sequelize.org/)
- [数据库 egg-sequelize](https://github.com/eggjs/egg-sequelize)
- [路由 egg-router-plus](https://github.com/eggjs/egg-router-plus)
- [校验 egg-validate](https://github.com/eggjs/egg-validate)

[egg]: https://eggjs.org
