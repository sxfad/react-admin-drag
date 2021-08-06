'use strict';
const { Service } = require('egg');
const axios = require('axios');


let TOKEN = null;
const BASE_URL = 'https://qyapi.weixin.qq.com/cgi-bin';

/**
 * Test Service
 */
module.exports = class WeChatService extends Service {
  async weChatRequest(options) {
    if (!TOKEN) TOKEN = await this.getToken();

    // `params` are the URL parameters to be sent with the request
    // Must be a plain object or a URLSearchParams object
    // `data` is the data to be sent as the request body

    const { url, method = 'GET', params = {}, data = {} } = options;

    params.access_token = TOKEN;
    data.access_token = TOKEN;

    const res = await axios({
      url: `${BASE_URL}${url}`,
      method,
      params,
      data,
    });

    const resData = res.data;

    if (resData.errcode === 0 && resData.errmsg === 'ok') {
      return resData;
    }
    throw Error(resData.errmsg);
  }

  async getToken() {
    const { corpId, corpSecret } = this.app.config;

    const res = await axios({
      url: `${BASE_URL}/gettoken?corpid=${corpId}&corpsecret=${corpSecret}`,
      method: 'GET',
    });

    const data = res.data;

    if (data.errcode === 0 && data.errmsg === 'ok') {

      // 快过期时，清空
      setTimeout(() => {
        TOKEN = null;
      }, (data.expires_in - 100) * 1000);

      return data.access_token;
    }

    throw Error(data.errmsg);
  }

  async getDepartments() {
    // 获取部门列表
    const res = await this.weChatRequest({ url: '/department/list' });
    const { department } = res;

    return department || [];
  }

  async getUsers() {
    // 获取部门列表
    const res = await this.weChatRequest({ url: '/department/list' });
    const { department } = res;

    if (!department) return [];

    // 获取所有顶级节点
    const topDepartments = department.filter(item => !department.find(it => it.id === item.parentid));
    const users = [];

    for (const dep of topDepartments) {
      const { id } = dep;
      const params = {
        department_id: id,
        fetch_child: 1, // 递归查子级
      };
      const res = await this.weChatRequest({ url: '/user/list', params });

      const { userlist } = res;
      // 有的人员跨度多个部门，会重复；
      userlist.forEach(item => {
        if (!users.find(it => it.userid === item.userid)) {
          users.push(item);
        }
      });
    }

    return users;
  }

  async login(code) {
    const res = await this.weChatRequest({ url: '/user/getuserinfo', params: { code } });

    const { UserId } = res;

    return UserId;
  }
};
