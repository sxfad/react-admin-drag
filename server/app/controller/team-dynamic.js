'use strict';
const { Op } = require('sequelize');
const Controller = require('egg').Controller;

module.exports = class TeamDynamicController extends Controller {
  // 获取动态 team user 公用
  async index(ctx) {
    const { pageNum = 1, pageSize = 10, teamId, userId } = ctx.query;
    const { TeamDynamic, User, Team } = ctx.model;

    const page = 'pageNum' in ctx.query ? {
      offset: (pageNum - 1) * pageSize,
      limit: +pageSize,
    } : undefined;

    const where = {};
    if (teamId) where.teamId = teamId;
    if (userId) where.userId = userId;

    const { rows, count } = await TeamDynamic.findAndCountAll({
      ...page,
      where,
      order: [
        [ 'updatedAt', 'DESC' ],
      ],
    });

    const result = rows.map(item => item.toJSON());

    if (teamId) {
      const team = await Team.findByPk(teamId);
      const userIds = result.map(item => item.userId);
      const users = await User.findAll({ where: { id: { [Op.in]: userIds } } });
      result.forEach(item => {
        item.user = users.find(it => it.id === item.userId);
        item.team = team;
      });

    }
    if (userId) {
      const user = await User.findByPk(userId);
      const teamIds = result.map(item => item.teamId);
      const teams = await Team.findAll({ where: { id: { [Op.in]: teamIds } } });
      result.forEach(item => {
        item.team = teams.find(it => it.id === item.teamId);
        item.user = user;
      });
    }

    ctx.success({ rows: result, count });
  }

  // 创建团队动态
  async create(ctx) {
    const { user, request: { body: requestBody } } = ctx;
    const { TeamDynamic } = ctx.model;

    ctx.validate({
      teamId: 'int',
      content: 'string',
    }, requestBody);

    const saved = await TeamDynamic.create({ ...requestBody, userId: user.id });

    return ctx.success(saved);
  }
};
