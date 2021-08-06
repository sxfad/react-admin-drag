'use strict';

module.exports = app => {
  const {STRING, INTEGER} = app.Sequelize;

  const Team = app.model.define('team', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    name: STRING(200),
    description: STRING(500),
  });

  // Team.sync({ force: true });
  Team.associate = function() {
    // 与User表是多对多关系
    app.model.Team.belongsToMany(app.model.User, {
      through: app.model.TeamUser,
    });
  };

  return Team;
};
