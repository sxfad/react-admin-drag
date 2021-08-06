'use strict';

module.exports = app => {
  const { STRING, INTEGER, UUID, UUIDV4 } = app.Sequelize;

  const User = app.model.define('user', {
    id: {
      type: UUID,
      allowNull: false,
      primaryKey: true,
      unique: true,
      defaultValue: UUIDV4,
    },
    account: STRING(20),
    jobNumber: STRING(20),
    password: STRING(100),
    name: STRING(20),
    email: STRING(100),
    mobile: STRING(20),
    gender: INTEGER, // 1 男 2 女
    avatar: STRING(200),
    position: STRING(50),
    status: INTEGER,
    isAdmin: INTEGER,
    enable: {
      type: INTEGER,
      defaultValue: 1,
    },
    qrCode: STRING(200),
  });

  // User.sync({ force: true });

  User.associate = function() {
    // 与Role存在多对多关系，使用belongsToMany()
    app.model.User.belongsToMany(app.model.Role, {
      through: app.model.RoleUser,
    });

    // 与Department存在多对多关系，使用belongsToMany()
    app.model.User.belongsToMany(app.model.Department, {
      through: app.model.DepartmentUser,
    });

    // 与Team存在多对多关系，使用belongsToMany()
    app.model.User.belongsToMany(app.model.Team, {
      through: app.model.TeamUser,
    });
  };

  return User;
};
