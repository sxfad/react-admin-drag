'use strict';

module.exports = app => {
  const { STRING, UUID, UUIDV4 } = app.Sequelize;

  const Permission = app.model.define('permission', {
    id: {
      type: UUID,
      allowNull: false,
      primaryKey: true,
      unique: true,
      defaultValue: UUIDV4,
    },
    name: STRING(200),
    code: STRING(20),
    description: STRING(500),
  });

  // Permission.sync({force: true});

  Permission.associate = function() {
    // 与Role表是多对多关系
    app.model.Permission.belongsToMany(app.model.Role, {
      through: app.model.RolePermission,
    });
  };
  return Permission;
};
