const sqlite3 = require('sqlite3').verbose();

// 打开（创建数据库），参数为文件名，不存在会自动创建
// ":memory:"表示匿名存在内存中的数据库，空字符串表示匿名于磁盘的数据库。匿名数据库不会被持久化，关闭数据库句柄时，其内容将会丢失。
const db = new sqlite3.Database('generator.db');

// serialize 保证db代码顺序执行
db.serialize(function() {
  db.run('CREATE TABLE IF NOT EXISTS  lorem (info TEXT)');

  var stmt = db.prepare('INSERT INTO lorem VALUES (?)');
  for (var i = 0; i < 10; i++) {
    stmt.run('Ipsum ' + i);
  }
  stmt.finalize();

  db.each('SELECT rowid AS id, info FROM lorem', function(err, row) {
    console.log(row.id + ': ' + row.info);
  });
});

db.close();
