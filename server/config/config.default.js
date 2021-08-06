/* eslint valid-jsdoc: "off" */

'use strict';
const path = require('path');

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const exports = {};

  // use for cookie sign key, should change to your own and keep security
  exports.keys = appInfo.name + '_1597806902764_7388';

  // add your middleware config here
  exports.middleware = [
    'authenticate',
    'errorHandler',
  ];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  // 静态文件
  exports.static = {
    prefix: '/public/',
    dir: [
      path.join(appInfo.baseDir, 'app/public'),
      {
        prefix: '/public/static',
        dir: path.join(appInfo.baseDir, 'app/public/static'),
        maxAge: 31536000,
      },
      {
        prefix: '/docs',
        dir: path.join(appInfo.baseDir, 'docs'),
      },
    ],
  };

  // 页面模板引擎
  exports.view = {
    root: path.join(appInfo.baseDir, 'app/public'),
    mapping: {
      '.ejs': 'ejs',
      '.html': 'ejs',
    },
  };

  exports.security = {
    // domainWhiteList: [
    //   'localhost:4200',
    // ],
    csrf: {
      enable: false,
    },
  };

  exports.cors = {
    // origin: '*', // 'Access-Control-Allow-Origin': '*',
    credentials: true,
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
  };

  exports.logger = {
    consoleLevel: 'DEBUG',
    dir: path.join(appInfo.baseDir, 'logs'),
  };

  // jwt
  exports.jwt = {
    cookieName: 'SESSION_ID',
    tokenName: 'token',
    // 最小单位 秒
    expire: 60 * 60 * 24 * 365, // 1年
    // expire: 3, // 秒
    secret: 'asdfadfadsaqwetasdf',
  };

  // 不需要登录的api 地址
  exports.noAuthApis = [
    '/api/login',
    '/api/wechat/login',
    '/api/register',
  ];

  // swagger 文档
  exports.swaggerdoc = {
    dirScanner: './app/controller',
    apiInfo: {
      title: 'egg-swagger',
      description: 'swagger-ui for egg',
      version: '1.0.0',
    },
    schemes: [ 'http', 'https' ],
    consumes: [ 'application/json' ],
    produces: [ 'application/json' ],
    securityDefinitions: {
      // apikey: {
      //   type: 'apiKey',
      //   name: 'clientkey',
      //   in: 'header',
      // },
      // oauth2: {
      //   type: 'oauth2',
      //   tokenUrl: 'http://petstore.swagger.io/oauth/dialog',
      //   flow: 'password',
      //   scopes: {
      //     'write:access_token': 'write access_token',
      //     'read:access_token': 'read access_token',
      //   },
      // },
    },
    enableSecurity: false,
    // enableValidate: true,
    routerMap: false,
    enable: true,
  };

  exports.validate = {
    convert: true,
    // validateRoot: false,
  };

  return {
    ...exports,
    ...userConfig,
  };
};
