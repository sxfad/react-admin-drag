'use strict';
const { Op } = require('sequelize');

const roleName = {
  master: '管理员',
  member: '成员',
};

module.exports = {
  create: async (ctx, next) => {
    await next();

    const { TeamDynamic } = ctx.model;
    const { id: teamId, name } = ctx.body;
    const content = `创建了团队「<a data-link="/teams/${teamId}">${name}</a>」`;

    await TeamDynamic.create({ teamId, content, userId: ctx.user.id });
  },

  update: async (ctx, next) => {
    await next();

    const { TeamDynamic } = ctx.model;
    const { id: teamId, name } = ctx.body;
    const content = `更新了团队「<a data-link="/teams/${teamId}">${name}</a>」`;

    await TeamDynamic.create({ teamId, content, userId: ctx.user.id });
  },
  destroy: async (ctx, next) => {
    const { TeamDynamic, Team } = ctx.model;
    const teamId = ctx.params.id;
    const prevTeam = await Team.findByPk(teamId);

    await next();

    const content = `删除了团队「${prevTeam.name}」`;

    await TeamDynamic.create({ teamId, content, userId: ctx.user.id });
  },
  addMembers: async (ctx, next) => {
    await next();

    const { TeamDynamic, User } = ctx.model;

    const { teamId } = ctx.params;
    const { userIds, role } = ctx.request.body;

    const users = await User.findAll({ where: { id: { [Op.in]: userIds } } });

    const content = `添加了成员「${users.map(user => `<a data-link="/users/${user.id}">${user.name}</a>`).join(', ')}」为「${roleName[role]}」`;
    await TeamDynamic.create({ teamId, content, userId: ctx.user.id });
  },

  updateMember: async (ctx, next) => {
    const { TeamDynamic, User, Team } = ctx.model;

    const { teamId, id: memberId } = ctx.params;
    const { role } = ctx.request.body;

    const member = await User.findOne({
      where: {
        id: memberId,
      },
      include: {
        model: Team,
        where: { id: teamId },
      },
    });

    if (!member) return await next();

    let prevRole;
    if (member && member.teams && member.teams.length) prevRole = member.teams[0].teamUser.role;

    await next();

    const content = `修改了成员「<a data-link="/users/${member.id}">${member.name}</a>」角色，由「${roleName[prevRole]}」更改为「${roleName[role]}」`;
    await TeamDynamic.create({ content, teamId, userId: ctx.user.id });
  },

  destroyMember: async (ctx, next) => {
    await next();

    const { TeamDynamic, User } = ctx.model;

    const { id: memberId, teamId } = ctx.params;

    const member = await User.findByPk(memberId);

    const content = `移除了团队成员「<a data-link="/users/${member.id}">${member.name}</a>」`;
    await TeamDynamic.create({ teamId, content, userId: ctx.user.id });
  },
  leave: async (ctx, next) => {
    await next();

    const { TeamDynamic, Team } = ctx.model;

    const { teamId } = ctx.params;

    const team = await Team.findByPk(teamId);

    const content = `「<a data-link="/users/${ctx.user.id}">${ctx.user.name}</a>」离开了团队「<a data-link="/teams/${team.id}">${team.name}</a>」`;
    await TeamDynamic.create({ teamId, content, userId: ctx.user.id });
  },
};
