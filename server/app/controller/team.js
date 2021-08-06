'use strict';
const { Op } = require('sequelize');
const Controller = require('egg').Controller;

module.exports = class TeamController extends Controller {
  // 查询
  async index(ctx) {
    const user = ctx.user;
    const { name, ids } = ctx.query;
    const { Team, User, SubApp } = ctx.model;

    let where = {
      [Op.and]: [
        name ? { name: { [Op.like]: `%${name.trim()}%` } } : undefined,
      ],
    };

    if (ids) where = { id: { [Op.in]: ids.split(',') } };

    const options = {
      where,
      include: [ User, SubApp ],
      order: [
        [ 'updatedAt', 'DESC' ],
      ],
    };

    let result = await Team.findAll(options);

    if (!user.isAdmin) {
      result = result.filter(item => item.users && item.users.find(it => it.id === user.id));
    }
    ctx.success(result);
  }

  // 获取详情
  async show(ctx) {
    ctx.validate({
      id: 'int',
    }, ctx.params);

    const { id } = ctx.params;
    const { Team, User, SubApp } = ctx.model;

    const result = await Team.findByPk(id, { include: [ User, SubApp ] });

    if (!result) return ctx.fail(404, '您访问的资源不存在');

    ctx.success(result);
  }

  // 创建
  async create(ctx) {
    const user = ctx.user;
    const requestBody = ctx.request.body;
    const Team = ctx.model.Team;

    ctx.validate({
      name: 'string',
      description: 'string?',
      subAppIds: 'array',
    }, requestBody);

    const { name, subAppIds } = requestBody;

    const foundTeam = await Team.findOne({ where: { name } });
    if (foundTeam) return ctx.fail('此团队名已存在');

    // 多次数据库操作，进行事务处理
    let transaction;
    try {
      transaction = await ctx.model.transaction();

      const savedTeam = await user.createTeam({ ...requestBody }, {
        transaction,
        through: { role: 'owner' },
      });

      await savedTeam.setSubApps(subAppIds, { transaction });

      await transaction.commit();

      return ctx.success(savedTeam);
    } catch (e) {
      if (transaction) await transaction.rollback();

      throw e;
    }

  }

  // 更新
  async update(ctx) {
    const requestBody = ctx.request.body;

    ctx.validate({
      id: 'int',
    }, ctx.params);

    ctx.validate({
      name: 'string',
      description: 'string?',
      subAppIds: 'array',
    }, requestBody);

    const { id } = ctx.params;
    const { name, subAppIds } = requestBody;
    const { Team } = ctx.model;

    const team = await Team.findByPk(id);
    if (!team) return ctx.fail('团队不存在或已删除！');

    const exitName = await Team.findOne({ where: { name } });
    if (exitName && exitName.id !== id) return ctx.fail('此团队名已被占用！');


    // 多次数据库操作，进行事务处理
    let transaction;
    try {
      transaction = await ctx.model.transaction();

      const savedTeam = await team.update({ ...requestBody }, { transaction });

      await savedTeam.setSubApps(subAppIds, { transaction });

      await transaction.commit();

      return ctx.success(savedTeam);
    } catch (e) {
      if (transaction) await transaction.rollback();

      throw e;
    }
  }

  // 删除
  async destroy(ctx) {
    ctx.validate({
      id: 'int',
    }, ctx.params);

    const { id } = ctx.params;
    const { Team } = ctx.model;

    // 多次数据库操作，进行事务处理
    let transaction;
    try {
      transaction = await ctx.model.transaction();

      // 删除当前团队
      const result = await Team.destroy({ where: { id }, transaction });

      await transaction.commit();
      ctx.success(result);
    } catch (e) {
      if (transaction) await transaction.rollback();

      throw e;
    }
  }

  // 查询成员
  async members(ctx) {
    ctx.validate({
      teamId: 'int',
    }, ctx.params);

    const { teamId } = ctx.params;
    const { Team } = ctx.model;

    const team = await Team.findByPk(teamId);
    if (!team) ctx.fail('团队不存在，或已删除');

    const result = await team.getUsers();

    ctx.success(result);
  }

  // 添加成员
  async addMembers(ctx) {
    ctx.validate({
      teamId: 'int',
    }, ctx.params);

    ctx.validate({
      userIds: 'array',
      role: [ 'master', 'member' ],
    }, ctx.request.body);

    const { teamId } = ctx.params;
    const { userIds, role } = ctx.request.body;

    const { Team, TeamUser } = ctx.model;

    const team = await Team.findByPk(teamId);
    if (!team) ctx.fail('团队不存在，或已删除');

    const users = userIds.map(userId => ({ userId, role, teamId }));

    const result = await TeamUser.bulkCreate(users);

    ctx.success(result);
  }

  // 修改成员
  async updateMember(ctx) {
    ctx.validate({
      teamId: 'int',
      id: 'string',
    }, ctx.params);

    ctx.validate({
      role: [ 'master', 'member' ],
    }, ctx.request.body);

    const { teamId, id } = ctx.params;
    const { role } = ctx.request.body;

    const { TeamUser } = ctx.model;

    const teamUser = await TeamUser.findOne({
      where: {
        teamId,
        userId: id,
      },
    });

    if (!teamUser) ctx.fail('记录不存在，或已删除');

    const result = await teamUser.update({ role });
    ctx.success(result);
  }

  // 删除成员
  async destroyMember(ctx) {
    ctx.validate({
      teamId: 'int',
      id: 'string',
    }, ctx.params);

    const { teamId, id } = ctx.params;
    const { TeamUser } = ctx.model;

    const result = await TeamUser.destroy({
      where: {
        teamId,
        userId: id,
      },
    });

    ctx.success(result);
  }

  // 离开团队
  async leave(ctx) {
    ctx.validate({
      teamId: 'int',
    }, ctx.params);

    const memberId = ctx.user.id;
    const { teamId } = ctx.params;
    const { TeamUser } = ctx.model;

    const result = await TeamUser.destroy({
      where: {
        teamId,
        userId: memberId,
      },
    });

    ctx.success(result);
  }

  // 根据用户id获取用户团队
  async userTeams(ctx) {
    ctx.validate({
      userId: 'string',
    }, ctx.query);

    const { userId } = ctx.query;

    const { Team, User } = ctx.model;

    const teams = await Team.findAll({
      include: {
        model: User,
        where: {
          id: userId,
        },
      },
    });
    ctx.success(teams);
  }

  // 获取用户团队
  async userTeamById(ctx) {
    ctx.validate({
      userId: 'string',
      teamId: 'int',
    }, ctx.query);

    const { userId, teamId } = ctx.query;

    const { Team, User } = ctx.model;

    const team = await Team.findOne({
      where: { id: teamId },
      include: {
        model: User,
        where: {
          id: userId,
        },
      },
    });
    ctx.success(team);
  }
};
