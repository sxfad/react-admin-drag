'use strict';

module.exports = {
  success(data) {
    // this 就是 ctx 对象，在其中可以调用 ctx 上的其他方法，或访问属性
    this.response.status = 200;
    if (data !== undefined) this.body = data;
  },
  fail(...args) {
    // 自定义code 1000以上，避免与http 状态码冲突
    let [ code = -1, message, data ] = args;

    // 如果是一个参数，直接为message
    if (args.length === 1) {
      message = args[0];
      code = -1;
      data = undefined;
    }

    const err = typeof message === 'string' ? Error(message) : message;

    // 设置 http 状态码
    let httpCode = 400;
    if (code > 0 && code < 600) httpCode = code;

    // 使用throw，执行到throw时，此次请求就结束了，ctx.fail 前面不必添加return
    this.throw(httpCode, {
      isCtxFail: true,
      error: err,
      code,
      data,
    });
  },
};
