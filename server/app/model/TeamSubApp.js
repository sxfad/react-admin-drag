'use strict';
module.exports = app => {
  const { UUID, INTEGER } = app.Sequelize;

  return app.model.define('teamSubApp', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    subAppId: UUID,
    teamId: INTEGER,
  });
};
