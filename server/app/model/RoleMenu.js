'use strict';
module.exports = app => {
  const { UUID, UUIDV4 } = app.Sequelize;

  return app.model.define('role_menu', {
    id: {
      type: UUID,
      allowNull: false,
      primaryKey: true,
      unique: true,
      defaultValue: UUIDV4,
    },
    roleId: UUID,
    menuId: UUID,
  });
};
