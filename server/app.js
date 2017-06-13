var express = require("express");
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var path = require('path');
var showdown = require('showdown');
var config = require('./config.json');
var database = require('./database');
var authenticationMiddleware = require('./middlewares/authentication');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(authenticationMiddleware.initialize());

app.post('/login', (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  if (!username || !password) {
    res.status(400);
    return res.send({ error: 'Invalid credentials'});
  }

  database.login(username, password)
    .then(userId => {
      if (!userId) {
        res.status(400);
        return res.send({ error: 'Invalid credentials'});
      }

      var expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + 3);

      res.send({
        token: jwt.sign({ id: userId, expire: expirationDate }, config.tokenKey)
      });
    })
    .catch(() => res.sendStatus(500));
})

app.get('/page/:path(*)', authenticationMiddleware.authenticate(), (req, res) => {
  var fileName = path.join(config.docFolder, req.params.path);

  if (fs.existsSync(fileName) && fs.lstatSync(fileName).isDirectory()) {
    var fileName = path.join(fileName, '-index.md');
    if (!fs.existsSync(fileName)) {
      return res.send('');
    }
  }
  else {
    fileName += '.md';

    if (!fs.existsSync(fileName)) {
      return res.sendStatus(404);
    }
  }

  var convertFunc = () => [{
    type: 'output',
    regex: /<img src="(.*)" alt="(.*)" \/>/gm,
    replace: '<img src="/img/' + req.params.version + '/$1?token=' + req.headers.authorization.split(' ')[1] + '" alt="$2" />'
  }];

  var converter = new showdown.Converter({ extensions: [convertFunc] });
  var text = fs.readFileSync(fileName, 'utf-8');

  res.send(converter.makeHtml(text));
});

app.get('/img/:path(*)', (req, res) => {
  jwt.verify(req.query.token, config.tokenKey, function(err, decoded) {
    if (err || new Date(decoded.expirationDate).getTime() < new Date().getTime()) {
      res.sendStatus('403');
      return;
    }

    var fileName = path.join(config.docFolder, req.params.path)

    if (!fs.existsSync(fileName)) {
      res.sendStatus('404');
      return;
    }

    res.sendFile(fileName);
  });
});

app.listen(config.port);
