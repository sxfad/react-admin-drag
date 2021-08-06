'use strict';
module.exports = {
  admin: async (ctx, next) => {
    // get方法不限制
    if (ctx.method === 'GET') return await next();

    const { id, userId } = ctx.params;

    const selfId = userId || id;

    // 用户自己
    if (ctx.user.id === selfId) return await next();

    if (!ctx.user.isAdmin) ctx.fail(403, '只有管理员才可以操作！');

    await next();
  },
  team: {
    owner: teamIdentity([ 'owner' ]),
    master: teamIdentity([ 'owner', 'master' ]),
    member: teamIdentity([ 'owner', 'master', 'member' ]),
  },
};


// 身份
function teamIdentity(identities) {
  return async (ctx, next) => {
    const teamId = ctx.params.teamId || ctx.query.teamId || ctx.request.body.teamId || ctx.params.id;

    const user = ctx.user;

    if (user.isAdmin) return await next();

    const found = await user.getTeams({ where: { id: teamId } });

    if (!found || !found.length) ctx.fail(403, '您没有操作权限');

    if (identities.includes(found[0].teamUser.role)) return await next();

    ctx.fail(403, '您没有操作权限');
  };
}
