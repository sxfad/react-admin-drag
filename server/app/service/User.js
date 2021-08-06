'use strict';

const bcrypt = require('bcryptjs');
const { Service } = require('egg');
const _ = require('lodash');

/**
 * Test Service
 */
module.exports = class UserService extends Service {


  /**
   * 对比密码
   * @param password
   * @param hashPassword
   * @returns {*}
   */
  comparePassword(password, hashPassword) {
    if (!password || !hashPassword) return false;

    return bcrypt.compareSync(password, hashPassword);
  }

  /**
   * 密码加密
   * @param password
   * @returns {*}
   */
  encryptPassword(password) {
    return bcrypt.hashSync(password, 8);
  }

  safeUser(user) {

    const omit = obj => {
      let userJson = obj;
      if (obj.toJSON) {
        userJson = obj.toJSON();
      }
      userJson.noPassword = !userJson.password;

      return _.omit(userJson, [ 'password' ]);
    };

    if (Array.isArray(user)) return user.map(item => omit(item));


    return omit(user);
  }

  async getUserMenus(userId) {
    const { ctx } = this;
    const { Menu, User } = ctx.model;
    let user = ctx.user;
    if (userId) {
      user = await User.findByPk(userId);
    }

    if (user.isAdmin) {
      const menus = await Menu.findAll();
      return ctx.success(menus);
    }

    // 获取所有角色
    const roles = await user.getRoles();
    const menus = [];

    for (const role of roles) {

      // 获取所有角色对应的菜单
      const ms = await role.getMenus();
      ms.forEach(item => {
        if (!menus.find(it => it.id === item.id)) {
          menus.push(item);
        }
      });
    }

    return menus;
  }
};
