'use strict';
const { Op } = require('sequelize');
const Controller = require('egg').Controller;
const jwt = require('jsonwebtoken');

/**
 * @Controller 用户
 */
module.exports = class UserController extends Controller {

  // 企业微信登录
  async weChatLogin(ctx) {
    ctx.validate({
      code: 'string',
    }, ctx.request.body);
    const { code } = ctx.request.body;
    const { weChat } = ctx.service;

    const userId = await weChat.login(code);

    const { User } = ctx.model;

    const user = await User.findOne({ where: { id: userId } });
    if (!user) return ctx.fail('您尚未被加入到此系统，请联系管理员！');

    return await this.doLogin(ctx, user);
  }

  // 账号密码登录
  async login(ctx) {
    ctx.validate({
      account: 'string',
      password: 'string',
    }, ctx.request.body);

    const { User } = ctx.model;
    const { user: userService } = ctx.service;
    const errorMessage = '用户名或密码错误';

    const { account, password } = ctx.request.body;

    const user = await User.findOne({ where: { account } });
    if (!user || !user.password) return ctx.fail(errorMessage);

    const verifyPassword = userService.comparePassword(password, user.password);
    if (!verifyPassword) return ctx.fail(errorMessage);

    return await this.doLogin(ctx, user);
  }

  async doLogin(ctx, user) {
    if (!user.enable) return ctx.fail('用户已被禁用');

    const { user: userService } = ctx.service;
    const { secret, expire, cookieName } = ctx.app.config.jwt;
    const { redis } = ctx.app;
    // expiresIn 单位 秒
    const token = jwt.sign({ id: user.id }, secret, { expiresIn: expire });

    ctx.cookies.set(cookieName, token,
      {
        maxAge: expire * 1000, // cookie有效时长 单位 毫秒s
        httpOnly: true, // 是否只用于http请求中获取
        overwrite: false, // 是否允许重写
      });

    // 存储到redis，退出登录会用到
    await redis.set(token, token);

    const safeUser = userService.safeUser(user);

    return ctx.success({ ...safeUser, token });
  }

  // 退出登录接口
  async logout(ctx) {
    const { redis } = ctx.app;
    const { cookieName } = ctx.app.config.jwt;

    const token = ctx.userToken;

    await redis.del(token);

    ctx.cookies.set(cookieName, null);

    ctx.success();
  }

  // 用户注册
  async create(ctx) {
    const requestBody = ctx.request.body;
    const User = ctx.model.User;
    const userService = ctx.service.user;

    ctx.validate({
      account: 'string',
      name: 'string',
      password: 'string',
    }, requestBody);

    const { password, account } = requestBody;

    const foundUser = await User.findOne({ where: { account } });
    if (foundUser) return ctx.fail('此用户名已存在');

    const ePassword = userService.encryptPassword(password);

    const savedUser = await User.create({ ...requestBody, password: ePassword });

    return ctx.success(savedUser);
  }

  // 获取所有用户
  async index(ctx) {
    const { pageNum = 1, pageSize = 10, keyWord, roleId, ids } = ctx.query;

    const { User, Role, Permission } = ctx.model;

    const page = 'pageNum' in ctx.query ? {
      offset: (pageNum - 1) * pageSize,
      limit: +pageSize,
    } : undefined;

    let where = keyWord ? {
      [Op.or]: [
        { name: { [Op.like]: `%${keyWord.trim()}%` } },
        { account: { [Op.like]: `%${keyWord.trim()}%` } },
        { email: { [Op.like]: `%${keyWord.trim()}%` } },
      ],
    } : undefined;

    if (ids) {
      where = {
        id: { [Op.in]: ids.split(',') },
      };
    }

    const options = {
      ...page,
      include: {
        model: Role,
        where: roleId ? { id: roleId } : undefined,
        left: true,
        include: Permission,
      },
      where,
      order: [
        [ 'jobNumber', 'ASC' ],
      ],
    };

    const { count, rows } = await User.findAndCountAll(options);


    // 查询用户的完整的角色列表
    let result = rows;
    if (roleId) {
      result = [];
      for (const user of rows) {
        const roles = await user.getRoles();
        const userJson = user.toJSON();

        result.push({ ...userJson, roles });
      }
    }

    ctx.success({ rows: ctx.service.user.safeUser(result), count });
  }

  // 获取用户详情
  async show(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;

    const { User } = ctx.model;

    const result = await User.findByPk(id);

    if (!result) return ctx.fail(404, '您访问的资源不存在');

    ctx.success(ctx.service.user.safeUser(result));
  }

  // 获取当前登录用户
  async getLoginUser(ctx) {
    const { user: userService } = ctx.service;
    const menus = await userService.getUserMenus();

    const data = ctx.service.user.safeUser(ctx.user);
    data.menus = menus;

    ctx.success(data);
  }

  // 获取用户及组织架构
  async getUsersAndDepartments(ctx) {
    const { Department, User, DepartmentUser } = ctx.model;
    const users = await User.findAll();
    const departments = await Department.findAll();
    const departmentUsers = await DepartmentUser.findAll();

    ctx.success({ users, departments, departmentUsers });
  }

  // 更新用户
  async update(ctx) {
    const requestBody = ctx.request.body;
    ctx.validate({
      id: 'string',
    }, ctx.params);

    ctx.validate({
      account: 'string',
      password: 'string?',
      email: 'string',
    }, requestBody);

    const { id } = ctx.params;
    const { account, password, email } = requestBody;

    const { User } = ctx.model;
    const { user: userService } = ctx.service;

    const user = await User.findByPk(id);
    if (!user) return ctx.fail('用户不存在或已删除！');

    const exitName = await User.findOne({ where: { account } });
    if (exitName && exitName.id !== id) return ctx.fail('此用户名已被占用！');

    const exitEmail = await User.findOne({ where: { email } });
    if (exitEmail && exitEmail.id !== id) return ctx.fail('此邮箱已被占用！');

    const userData = { ...requestBody };
    if (password) {
      userData.password = userService.encryptPassword(password);
    }

    const result = await user.update(userData);

    ctx.success(result);
  }

  // 删除用户
  async destroy(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;
    const { User } = ctx.model;
    const result = await User.destroy({ where: { id } });

    ctx.success(result);
  }

  async destroyUsers(ctx) {
    ctx.validate({
      ids: 'string',
    }, ctx.query);
    const { ids } = ctx.query;
    const { User } = ctx.model;

    const result = await User.destroy({ where: { id: { [Op.in]: ids.split(',') } } });
    ctx.success(result);
  }

  // 修改密码
  async updatePassword(ctx) {
    ctx.validate({
      oldPassword: 'string?',
      password: 'string?',
    }, ctx.request.body);

    const { oldPassword, password } = ctx.request.body;

    const currentUser = ctx.user;
    const userService = ctx.service.user;

    let isSame;

    // 用户没有设置过密码，不校验原密码
    if (!currentUser.password) {
      isSame = true;
    } else {
      if (!oldPassword) return ctx.fail('原密码不能为空！');
      isSame = userService.comparePassword(oldPassword, currentUser.password);
    }

    if (!isSame) return ctx.fail('原密码输入错误！');

    const hashPassword = userService.encryptPassword(password);

    await currentUser.update({ password: hashPassword });

    ctx.success(true);
  }

  // 同步微信用户
  async syncWeChat(ctx) {
    const { weChat } = ctx.service;

    const { Department, User, Role, DepartmentUser } = ctx.model;

    // 所有部门
    const departs = await weChat.getDepartments();

    // 所有用户
    const users = await weChat.getUsers();
    users.forEach(item => {
      item.id = item.userid;
      item.jobNumber = item.alias;
      item.account = item.alias;
      item.qrCode = item.qr_code;
      item.bigAvatar = item.avatar;
      item.avatar = item.thumb_avatar;
    });

    // 多次数据库操作，进行事务处理
    let transaction;
    try {
      transaction = await ctx.model.transaction();

      // 处理部门
      for (const depart of departs) {
        const { id } = depart;
        const dep = await Department.findByPk(id, { transaction });

        // 微信新增了部门
        if (!dep) {
          await Department.create(depart, { transaction });
        } else {

          // 部门存在，进行更新
          await dep.update(depart, { transaction });
        }
      }

      // 处理用户
      for (const user of users) {
        const { id, department, is_leader_in_dept, order } = user;
        const u = await User.findByPk(id, { transaction });

        // 微信新增了用户
        let newUser;
        if (!u) {
          // 添加用户，并设置为员工角色
          const role = await Role.findOne({ where: { name: '员工' }, transaction });
          newUser = await role.createUser(user, { transaction });
        } else {
          // 原用户，更新属性
          newUser = await u.update(user, { transaction });
        }

        // 更新人员 与 部门关系
        await DepartmentUser.destroy({ where: { userId: newUser.id }, transaction });

        if (department && department.length) {
          for (let i = 0; i < department.length; i++) {
            const depId = department[i];

            await DepartmentUser.create({
              userId: newUser.id,
              departmentId: depId,
              isLeader: is_leader_in_dept[i],
              order: order[i],
            }, { transaction });
          }
        }
      }

      await transaction.commit();
      ctx.success();
    } catch (e) {
      if (transaction) await transaction.rollback();

      throw e;
    }
    ctx.success(true);
  }

  // 关联角色
  async relateUserRoles(ctx) {
    const reqBody = ctx.request.body;
    ctx.validate({
      userId: 'string',
      roleIds: 'array',
    }, reqBody);

    const { userId, roleIds } = reqBody;

    const { RoleUser } = ctx.model;

    // 多次数据库操作，进行事务处理
    let transaction;
    try {
      transaction = await ctx.model.transaction();

      // 删除原有关联
      await RoleUser.destroy({ where: { userId }, transaction });

      // 插入新的关联
      const userRoles = roleIds.map(roleId => ({ userId, roleId }));
      await RoleUser.bulkCreate(userRoles, { transaction });

      await transaction.commit();

      ctx.success();
    } catch (e) {
      if (transaction) await transaction.rollback();

      throw e;
    }
  }

  // 获取当前登录用户菜单
  async sessionUserMenus(ctx) {
    const { user: userService } = ctx.service;
    const menus = await userService.getUserMenus();

    ctx.success(menus);
  }
};
