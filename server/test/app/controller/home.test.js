'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/controller/home.test.js', () => {
  it('should assert', () => {
    const pkg = require('../../../package.json');
    assert(app.config.keys.startsWith(pkg.name));
    // const ctx = app.mockContext({});
    // yield ctx.service.xx();
  });

  it('should OK', () => {
    const helper = require('../../../app/extend/helper');

    assert(helper.foo(123) === 246);
    // const ctx = app.mockContext({});
    // yield ctx.service.xx();
  });
});
