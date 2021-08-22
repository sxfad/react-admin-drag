const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// 数据库文件，不存在会自动创建
const DATABASE_FILE = path.join(__dirname, 'generator.db');

/**
 * 执行sql语句
 * @param sql
 * @param params
 */
module.exports = async function execSql(sql, params) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DATABASE_FILE);
    // serialize 保证db代码顺序执行
    db.serialize(function() {
      db.all(sql, params, function(err, row) {
        if (err) {
          reject(err);
          return;
        }
        resolve(row);
      });
    });

    db.close();
  });
};
