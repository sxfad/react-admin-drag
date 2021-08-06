'use strict';
const { pathToRegexp } = require('path-to-regexp');
const jwt = require('jsonwebtoken');

/** 鉴权拦截 */
function canPass(ctx) {
  const { noAuthApis } = ctx.app.config;

  if (/^\/api/.test(ctx.path)) {
    return pathToRegexp(noAuthApis).test(ctx.path);
  }

  return true;
}

/**
 * 三种方式获取token
 * headers: <tokenName>: <token>
 * headers: Authorization: Bearer <token>
 * cookie:  <cookieName>=<token>
 * 优先级： tokenName > Authorization > cookieName
 *
 * @param ctx
 * @returns {Promise<*|string>}
 */
async function getToken(ctx) {
  const { tokenName, cookieName } = ctx.app.config.jwt;

  let token;
  const headerToken = ctx.request.header[String(tokenName).toLowerCase()];
  const authorizationToken = (ctx.request.header.authorization || '').replace('Bearer', '').trim();
  const cookieToken = ctx.cookies.get(cookieName);

  if (cookieToken) token = cookieToken;
  if (authorizationToken) token = authorizationToken;
  if (headerToken) token = headerToken;

  return token;

  // 验证redis中token是否存在，无论前端以什么方式保存了token 都会彻底失效
  // const { redis } = ctx.app;
  // const existToken = await redis.get(token);
  // return existToken || 'no token';
}

/** 验证用户是否已经登录，做统一拦截 */
module.exports = () => {
  return async function auth(ctx, next) {
    const { secret } = ctx.app.config.jwt;
    const { User } = ctx.model;

    if (canPass(ctx)) return await next();

    const token = await getToken(ctx);

    // 验证
    try {
      const decoded = jwt.verify(token, secret);

      const { id } = decoded;

      const user = await User.findByPk(id);

      if (!user) throw Error('用户不存在');

      // ctx.user 为只读属性，防止业务代码串改
      Object.defineProperty(ctx, 'user', {
        writable: false,
        value: user,
      });

      Object.defineProperty(ctx, 'userToken', {
        writable: false,
        value: token,
      });

      await next();
    } catch (e) {
      ctx.status = 401;
    }
  };
};

