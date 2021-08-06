'use strict';
/**
 * 本地开发环境配置
 *
 * 最终生效的配置为 local + default（前者覆盖后者）
 */

module.exports = () => {
  const exports = {};

  // 数据库配置
  exports.sequelize = {
    dialect: 'mysql',
    connectionUri: 'mysql://fd:123456@172.16.60.247:3306/react_admin_drag_dev', // 架构测试
    // connectionUri: 'mysql://fd:123456@172.16.60.247:3306/react_admin_drag_test', // 架构测试
    // connectionUri: 'mysql://fd:123456@172.16.60.247:3306/react_admin_drag_prod', // 架构测试库

    timezone: '+08:00',
    define: {
      // paranoid: true,
      charset: 'utf8',
      dialectOptions: {
        collate: 'utf8_general_ci',
      },
    },
    logging: false,
  };

  // // 企业ID
  // exports.corpId = 'ww791c6fe710a118bc'; // zkboys 自己创建的企业微信
  // // 应用的凭证密钥
  // exports.corpSecret = 'gpK44sqUDA-pfcV83yS3a9g3tQ7_4kxPynZfN_hDvpo';

  // 企业ID
  exports.corpId = 'wx8918a4299cc1b440'; // 公司企业微信
  // 应用的凭证密钥
  exports.corpSecret = 'wUQcs3PlyiurqT7nKXD9mHOgD99JBOfZkB5h2Udqmv8'; // 消息推送

  return exports;
};
