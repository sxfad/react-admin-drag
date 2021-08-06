'use strict';
const { Op } = require('sequelize');
const Controller = require('egg').Controller;

module.exports = class RoleController extends Controller {
  // 查询角色
  async index(ctx) {
    const { name } = ctx.query;

    const { Role } = ctx.model;

    const conditions = [];

    if (name) conditions.push({ name: { [Op.like]: `%${name.trim()}%` } });

    const options = {
      where: {
        [Op.and]: [ conditions ],
      },
      order: [
        [ 'updatedAt', 'ASC' ],
      ],
    };

    const result = await Role.findAll(options);

    ctx.success(result);
  }

  // 获取角色详情
  async show(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;

    const { Role, Menu } = ctx.model;

    const result = await Role.findByPk(id, {
      include: Menu,
    });

    if (!result) return ctx.fail(404, '您访问的资源不存在');

    ctx.success(result);
  }

  // 创建角色
  async create(ctx) {
    const requestBody = ctx.request.body;
    const Role = ctx.model.Role;

    ctx.validate({
      name: 'string',
      description: 'string?',
    }, requestBody);

    const { name } = requestBody;

    const foundRole = await Role.findOne({ where: { name } });
    if (foundRole) return ctx.fail('此角色名已存在');

    const savedRole = await Role.create({ ...requestBody });

    return ctx.success(savedRole);
  }

  // 更新角色
  async update(ctx) {
    const requestBody = ctx.request.body;

    ctx.validate({
      id: 'string',
    }, ctx.params);

    ctx.validate({
      name: 'string',
      description: 'string?',
    }, requestBody);

    const { id } = ctx.params;
    const { name } = requestBody;
    const { Role } = ctx.model;

    const role = await Role.findByPk(id);
    if (!role) return ctx.fail('角色不存在或已删除！');

    const exitName = await Role.findOne({ where: { name } });
    if (exitName && exitName.id !== id) return ctx.fail('此角色名已被占用！');

    const result = await role.update({ ...requestBody });
    ctx.success(result);
  }

  // 删除角色
  async destroy(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;
    const { Role } = ctx.model;
    const result = await Role.destroy({ where: { id } });

    ctx.success(result);
  }

  // 关联菜单
  async relateRoleMenus(ctx) {
    const reqBody = ctx.request.body;
    ctx.validate({
      menuIds: 'array',
      roleId: 'string',
    }, reqBody);

    const { menuIds, roleId } = reqBody;

    const { RoleMenu } = ctx.model;

    // 多次数据库操作，进行事务处理
    let transaction;
    try {
      transaction = await ctx.model.transaction();

      // 删除原有关联
      await RoleMenu.destroy({ where: { roleId }, transaction });

      // 插入新的关联
      const roleMenus = menuIds.map(menuId => ({ menuId, roleId }));
      await RoleMenu.bulkCreate(roleMenus, { transaction });

      await transaction.commit();

      ctx.success();
    } catch (e) {
      if (transaction) await transaction.rollback();

      throw e;
    }
  }
};
