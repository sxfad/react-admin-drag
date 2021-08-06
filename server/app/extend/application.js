'use strict';

const REDIS = Symbol('Application#redis');
module.exports = {

  // 数据库模拟Redis存储 需要使用真正redis，添加 egg-redis 插件，并把此处扩展删除即可
  get redis() {
    // this 就是 app 对象，在其中可以调用 app 上的其他方法，或访问属性
    if (!this[REDIS]) {
      // 实际情况肯定更复杂
      this[REDIS] = {
        get: async key => {
          const { Redis } = this.model;

          if (!key) return null;

          const result = await Redis.findOne({ where: { key } });

          return result ? JSON.parse(result.value).value : result;

        },
        set: async (key, value) => {
          const { Redis } = this.model;
          const val = JSON.stringify({ value });
          const result = await Redis.findOne({ where: { key } });

          if (result) {
            await Redis.update({ value: val }, { where: { id: result.id } });
          } else {
            await Redis.create({ key, value: val });
          }
        },
        del: async key => {
          if (!key) return;

          const { Redis } = this.model;
          await Redis.destroy({ where: { key } });
        },
      };
    }
    return this[REDIS];
  },
};
