const express = require('express');
var bodyParser = require('body-parser');

const app = express();
const port = 8888;

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

require('./app/routes')(app, {});
app.listen(port, () => {
  console.log('Modus Create Node.js API started on ' + port);
});