const execSql = require('./db');

(async () => {
  await execSql('CREATE TABLE IF NOT EXISTS  lorem (info TEXT)');

  await execSql('INSERT INTO lorem VALUES (?)', '2');

  const results = await execSql('SELECT * FROM lorem');

  console.log(results);
})();
