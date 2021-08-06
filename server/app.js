'use strict';

const bcrypt = require('bcryptjs');

module.exports = app => {
  /** 同步数据库 */
  const isSync = false;
  // const isSync = app.config.env === 'local' || app.config.env === 'unittest';
  if (isSync) {
    app.beforeStart(async () => {
      await app.model.sync({ force: true });

      const { Role } = app.model;

      const adminRole = await Role.create({
        name: '管理员',
        description: '管理员拥有所有系统权限',
        frozen: true,
      });

      const touristRole = await Role.create({
        name: '员工',
        description: '普通员工',
        frozen: true,
      });

      const defaultPassword = bcrypt.hashSync('123456', 8);

      // 创建一个管理员用户
      await adminRole.createUser({
        account: 'admin',
        jobNumber: 'admin',
        password: defaultPassword,
        name: '超级管理员',
        isAdmin: true,
        frozen: true,
        email: 'admin@qq.com',
        avatar: 'http://wework.qpic.cn/bizmail/iagwggOtlDFlcvSAsoCFX6ib26XF2c7kiaAF6I5cicfPkuhZTEmdsNEfOw/100',
      });

      // 创建一个游客
      await touristRole.createUser({
        account: 'test',
        jobNumber: 'test',
        password: defaultPassword,
        name: '员工',
        email: 'tourist@qq.com',
        avatar: 'http://wework.qpic.cn/bizmail/TaYPtwyovGuvgPwm6wfnf2rXZdVib27SuGaEh1rxyKncyEB46dKF47A/100',
      });

      // 初始化菜单 与超级管理员关联
      const menus = [
        { id: 'system', text: '系统管理', icon: 'user', order: 9900 },
        { parentId: 'system', text: '用户管理', icon: 'user', path: '/users', order: 900 },
        { parentId: 'system', text: '角色管理', icon: 'lock', path: '/roles', order: 900 },
        { parentId: 'system', text: '菜单管理', icon: 'align-left', path: '/menu', order: 900 },
        { parentId: 'system', text: '子应用管理', icon: 'align-left', path: '/sub-app', order: 900 },

        { text: '我的团队', icon: 'team', path: '/teams', order: 900 },
      ];
      for (const menu of menus) {
        await adminRole.createMenu(menu);
      }
    });
  }
};
