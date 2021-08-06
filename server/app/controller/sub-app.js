'use strict';
const { Op } = require('sequelize');
const Controller = require('egg').Controller;

module.exports = class SubAppController extends Controller {
  // 查询子应用
  async index(ctx) {
    const { pageNum = 1, pageSize = 10, keyWord } = ctx.query;

    const { SubApp } = ctx.model;

    const page = 'pageNum' in ctx.query ? {
      offset: (pageNum - 1) * pageSize,
      limit: +pageSize,
    } : undefined;

    const where = keyWord ? {
      [Op.or]: [
        'name',
        'entry',
        'activeRule',
        'description',
      ].map(field => ({ [field]: { [Op.like]: `%${keyWord.trim()}%` } })),
    } : undefined;

    const options = {
      ...page,
      where,
      order: [
        [ 'updatedAt', 'DESC' ],
      ],
    };

    const { count, rows } = await SubApp.findAndCountAll(options);

    ctx.success({ rows, count });
  }

  // 获取子应用详情
  async show(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;

    const { SubApp } = ctx.model;

    const result = await SubApp.findByPk(id);

    if (!result) return ctx.fail(404, '您访问的资源不存在');

    ctx.success(result);
  }

  // 创建子应用
  async create(ctx) {
    const requestBody = ctx.request.body;

    ctx.validate({
      entry: 'string',
      activeRule: 'string',
      name: 'string',
      description: 'string?',
      createMenu: 'boolean?',
    }, requestBody);

    const { SubApp, Menu } = ctx.model;

    const { name, entry, activeRule, createMenu } = requestBody;

    const allSubApps = await SubApp.findAll();

    let foundSubApp = allSubApps.find(item => item.name === name);
    if (foundSubApp) return ctx.fail('此子应用名已存在！');

    foundSubApp = allSubApps.find(item => item.entry === entry);
    if (foundSubApp) return ctx.fail('此子应用入口已存在！');

    foundSubApp = allSubApps.find(item => activeRule.startsWith(item.activeRule));
    if (foundSubApp) return ctx.fail('此子应用激活规则已存在或存在类似规则！');

    // 多次数据库操作，进行事务处理
    let transaction;
    try {
      transaction = await ctx.model.transaction();

      const savedSubApp = await SubApp.create({ ...requestBody }, { transaction });

      // 创建一个顶级菜单
      if (createMenu) {
        await Menu.create({
          text: name,
          type: '1',
          basePath: activeRule,
          path: '/',
          icon: 'align-left',
          order: 1000,
        }, { transaction });
      }

      await transaction.commit();

      return ctx.success(savedSubApp);
    } catch (e) {
      if (transaction) await transaction.rollback();

      throw e;
    }
  }

  // 更新子应用
  async update(ctx) {
    const requestBody = ctx.request.body;

    ctx.validate({
      id: 'string',
    }, ctx.params);

    ctx.validate({
      entry: 'string',
      activeRule: 'string',
      name: 'string',
      description: 'string?',
    }, requestBody);

    const { id } = ctx.params;
    const { name, entry, activeRule } = requestBody;
    const { SubApp } = ctx.model;

    const subApp = await SubApp.findByPk(id);
    if (!subApp) return ctx.fail('子应用不存在或已删除！');


    const allSubApps = await SubApp.findAll();

    let foundSubApp = allSubApps.find(item => item.name === name && item.id !== id);
    if (foundSubApp) return ctx.fail('此子应用名已存在！');

    foundSubApp = allSubApps.find(item => item.entry === entry && item.id !== id);
    if (foundSubApp) return ctx.fail('此子应用入口已存在！');

    foundSubApp = allSubApps.find(item => activeRule.startsWith(item.activeRule) && item.id !== id);
    if (foundSubApp) return ctx.fail('此子应用激活规则已存在或存在类似规则！');

    const result = await subApp.update({ ...requestBody });
    ctx.success(result);
  }

  // 删除子应用
  async destroy(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;
    const { SubApp } = ctx.model;
    const result = await SubApp.destroy({ where: { id } });

    ctx.success(result);
  }
};
