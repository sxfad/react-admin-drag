'use strict';

module.exports = app => {
  const { INTEGER, STRING, UUID, UUIDV4 } = app.Sequelize;

  const Menu = app.model.define('menu', {
    id: {
      type: UUID,
      allowNull: false,
      primaryKey: true,
      unique: true,
      defaultValue: UUIDV4,
    },
    parentId: UUID,
    text: STRING(200),
    type: {
      type: STRING(10),
      defaultValue: '1', // 1 菜单 2 功能
    },
    icon: STRING(200),
    basePath: STRING(200),
    path: STRING(200),
    url: STRING(200),
    target: STRING(200),
    order: INTEGER,
  });

  // Menu.sync({ force: true });

  Menu.associate = function() {
    // 与Role表是多对多关系
    app.model.Menu.belongsToMany(app.model.Role, {
      through: app.model.RoleMenu,
    });
  };

  return Menu;
};
