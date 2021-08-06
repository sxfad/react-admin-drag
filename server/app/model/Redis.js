'use strict';

module.exports = app => {
  const { STRING, TEXT, UUID, UUIDV4 } = app.Sequelize;

  const Redis = app.model.define('redis', {
    id: {
      type: UUID,
      allowNull: false,
      primaryKey: true,
      unique: true,
      defaultValue: UUIDV4,
    },
    key: {
      type: STRING,
      field: 'r_key',
    },
    value: {
      type: TEXT,
      field: 'r_value',
    },
  });

  // Redis.sync({ force: true });

  return Redis;
};
