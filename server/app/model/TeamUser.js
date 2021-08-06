'use strict';
module.exports = app => {
  const { ENUM, UUID, INTEGER } = app.Sequelize;

  return app.model.define('teamUser', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    userId: UUID,
    teamId: INTEGER,
    role: ENUM('owner', 'master', 'member'), // 创建者 管理员 成员
  });
};
