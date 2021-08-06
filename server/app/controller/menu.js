'use strict';
const { Op } = require('sequelize');
const Controller = require('egg').Controller;

module.exports = class MenuController extends Controller {
  // 查询菜单
  async index(ctx) {
    const { Menu } = ctx.model;
    const options = {
      order: [
        [ 'updatedAt', 'ASC' ],
      ],
    };

    const result = await Menu.findAll(options);

    ctx.success(result);
  }

  // 获取菜单详情
  async show(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;
    const { Menu } = ctx.model;

    const result = await Menu.findByPk(id);

    if (!result) return ctx.fail(404, '您访问的资源不存在');

    ctx.success(result);
  }

  // 创建菜单
  async create(ctx) {
    const requestBody = ctx.request.body;
    const Menu = ctx.model.Menu;

    ctx.validate({
      text: 'string',
    }, requestBody);

    const savedMenu = await Menu.create({ ...requestBody });

    return ctx.success(savedMenu);
  }

  // 更新菜单
  async update(ctx) {
    const requestBody = ctx.request.body;

    ctx.validate({
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;
    const { Menu } = ctx.model;

    const menu = await Menu.findByPk(id);
    if (!menu) return ctx.fail('菜单不存在或已删除！');

    const result = await menu.update({ ...requestBody });
    ctx.success(result);
  }

  // 删除菜单 及子菜单
  async destroy(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;
    const { Menu } = ctx.model;
    const menus = await Menu.findAll();

    const ids = [];
    const loop = parentId => {
      ids.push(parentId);
      const children = menus.filter(item => item.parentId === parentId);
      if (children) {
        children.forEach(it => loop(it.id));
      }
    };
    loop(id);

    const result = await Menu.destroy({
      where: {
        id: { [Op.in]: ids },
      },
    });

    ctx.success(result);
  }

  // 批量创建菜单
  async batchAddMenus(ctx) {
    const requestBody = ctx.request.body;

    ctx.validate({
      menus: 'array',
    }, requestBody);
    const { Menu } = ctx.model;
    const { menus } = requestBody;
    const result = await Menu.bulkCreate(menus);

    ctx.success(result);
  }
};
