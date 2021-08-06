'use strict';

module.exports = app => {
  const { STRING, UUID, UUIDV4 } = app.Sequelize;

  const Role = app.model.define('role', {
    id: {
      type: UUID,
      allowNull: false,
      primaryKey: true,
      unique: true,
      defaultValue: UUIDV4,
    },
    name: STRING(200),
    description: STRING(500),
  });

  // Role.sync({force: true});

  Role.associate = function() {
    // 与User表是多对多关系
    app.model.Role.belongsToMany(app.model.User, {
      through: app.model.RoleUser,
    });

    // 与permission表示多对多关系
    app.model.Role.belongsToMany(app.model.Permission, {
      through: app.model.RolePermission,
    });

    // 与Menu表是多对多关系
    app.model.Role.belongsToMany(app.model.Menu, {
      through: app.model.RoleMenu,
    });

  };

  return Role;
};
