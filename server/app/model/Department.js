'use strict';

module.exports = app => {
  const { STRING, INTEGER, BIGINT } = app.Sequelize;

  const Department = app.model.define('department', {
    id: {
      type: INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    parentId: INTEGER,
    order: BIGINT,
    name: STRING(100),
  });


  // Department.sync({ force: true });

  Department.associate = function() {
    // 与User存在多对多关系，使用belongsToMany()
    app.model.Department.belongsToMany(app.model.User, {
      through: app.model.DepartmentUser,
    });
  };

  return Department;
};

