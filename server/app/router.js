'use strict';
const path = require('path');
const fs = require('fs');
const permission = require('./middleware/permission');
const dynamic = require('./middleware/dynamic');

module.exports = app => {
  const { router, controller } = app;
  const api = router.namespace('/api'); // api开头的为接口

  const {
    user,
    role,
    menu,
    subApp,
    team,
    teamDynamic,
  } = controller;

  // 登录
  api.post('/login', user.login);
  api.post('/wechat/login', user.weChatLogin);
  // 退出登录
  api.post('/logout', user.logout);
  // 注册请求
  api.post('/register', user.create);

  // crud
  // 说明文档 https://eggjs.org/zh-cn/basics/router.html#restful-%E9%A3%8E%E6%A0%BC%E7%9A%84-url-%E5%AE%9A%E4%B9%89
  // 获取所有用户
  // api.get('/users', user.index);
  // // 根据id查询用户
  // api.get('/users/:id', user.show);
  // // 添加用户
  // api.post('/users', permission.admin, user.create);
  // // 更新用户
  // api.put('/users', permission.admin, user.update);
  // // 删除用户
  // api.del('/users/:id', permission.admin, user.destroy);
  api.resources('/users', permission.admin, user);
  api.del('/users', permission.admin, user.destroyUsers);
  // 同步微信用户、组织架构
  api.post('/syncWeChat', permission.admin, user.syncWeChat);
  // 修改密码
  api.put('/updatePassword', user.updatePassword);
  // 关联角色
  api.put('/relateUserRoles', permission.admin, user.relateUserRoles);
  // 获取当前登录用户菜单
  api.get('/sessionUserMenus', user.sessionUserMenus);
  // 获取当前登录用户
  api.get('/loginUser', user.getLoginUser);
  api.get('/usersAndDepartments', user.getUsersAndDepartments);

  // 角色 crud
  api.resources('/roles', permission.admin, role);
  // 关联菜单
  api.put('/relateRoleMenus', permission.admin, role.relateRoleMenus);

  // 菜单 crud
  api.resources('/menus', permission.admin, menu);
  // 批量添加菜单
  api.post('/batchAddMenus', permission.admin, menu.batchAddMenus);

  // 子应用 crud
  api.resources('/subApps', permission.admin, subApp);


  // 团队 crud
  api.get('/teams', team.index);
  api.get('/teams/:id', permission.team.member, team.show);
  api.post('/teams', dynamic.team.create, team.create);
  api.put('/teams/:id', permission.team.master, dynamic.team.update, team.update);
  api.del('/teams/:id', permission.team.master, dynamic.team.destroy, team.destroy);
  api.get('/userTeams', team.userTeams);
  api.get('/userTeamById', team.userTeamById);

  // 团队成员
  api.get('/teams/:teamId/members', permission.team.member, team.members);
  api.post('/teams/:teamId/members', permission.team.master, dynamic.team.addMembers, team.addMembers);
  api.put('/teams/:teamId/members/:id', permission.team.master, dynamic.team.updateMember, team.updateMember);
  api.del('/teams/:teamId/members/:id', permission.team.master, dynamic.team.destroyMember, team.destroyMember);
  api.del('/teams/:teamId/membersLeave', permission.team.member, dynamic.team.leave, team.leave);

  // 团队动态
  api.get('/teamDynamics', permission.team.member, teamDynamic.index);
  api.post('/teamDynamics', permission.team.member, teamDynamic.create);

  // 文档
  router.get('/docs', async ctx => {
    if (!ctx.path.endsWith('/')) return ctx.redirect(ctx.path + '/');

    const docFile = path.join(__dirname, '../', 'docs', 'index.html');
    ctx.body = fs.readFileSync(docFile, 'UTF-8');
  });

  // 未捕获的接口请求，返回404
  api.get('/*', async ctx => {
    ctx.status = 404;
  });

  // 所有页面请求 返回首页
  // TODO 区分是页面请求，还是其他ajax 请求、静态文件请求
  router.get('/*', async (ctx, next) => {
    if (ctx.path.startsWith('/swagger-')) return await next();
    if (ctx.path.startsWith('/iframe_page_')) return await next();

    return ctx.render('index.html');
  });
};
