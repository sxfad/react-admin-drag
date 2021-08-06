'use strict';

module.exports = app => {
  const { TEXT, UUID, INTEGER } = app.Sequelize;

  const TeamDynamic = app.model.define('teamDynamic', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    userId: UUID,
    teamId: INTEGER,
    content: TEXT,
  });

  // TeamDynamic.sync({ force: true });

  // TeamDynamic.associate = function() {
  //
  //   // 归属于用户（动态：用户 = n：1）用户删除的时候，动态也删除
  //   app.model.TeamDynamic.belongsTo(app.model.User, { onDelete: 'CASCADE' });
  //
  //   // 团队删除的时候，设置 dynamic.teamId = null
  //   app.model.TeamDynamic.belongsTo(app.model.Team, { onDelete: 'SET NULL' });
  // };

  return TeamDynamic;
};
