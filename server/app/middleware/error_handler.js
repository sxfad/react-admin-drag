'use strict';

module.exports = () => {
  return async function errorHandler(ctx, next) {
    try {
      await next();
    } catch (err) {
      const status = err.status || 500;
      const { code = -1, data, isCtxFail, error: ctxFailError } = err;

      let error = err;

      if (isCtxFail) error = ctxFailError;


      // 所有的异常都在 app 上触发一个 error 事件，框架会记录一条错误日志
      // TODO ctxFailError 是否需要记录日志？
      ctx.app.emit('error', error, ctx);

      // 生产环境时 500 错误的详细错误内容不返回给客户端，因为可能包含敏感信息
      if (status === 500 && ctx.app.config.env === 'prod') error = Error('Internal Server Error');

      // 从 error 对象上读出各个属性，设置到响应中
      ctx.body = {
        code,
        message: error.message,
        data,
      };

      if (status === 422) {
        ctx.body.errors = err.errors;
      }

      ctx.status = status;
    }
  };
};
