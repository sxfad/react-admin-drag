const express = require('express');
const gen = require('./index');
const app = express();
const port = 3300;
gen(app);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
