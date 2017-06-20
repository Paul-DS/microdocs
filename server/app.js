var express = require("express");
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var path = require('path');
var showdown = require('showdown');
var killable = require('killable');

var startServer = (callback) => {
  var app = express();

  app.use(bodyParser.json());

  var config = require('./config.json');
  var database = require('./database');
  var authenticationMiddleware = require('./middlewares/authentication');

  app.use(authenticationMiddleware.initialize());
  app.use(express.static(__dirname + '/../client/dist'));

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
  });

  app.get('/userInfo', authenticationMiddleware.authenticate(), (req, res) => {
    res.send(req.user);
  });

  app.get('/getFiles', authenticationMiddleware.authenticate(), (req, res) => {
    var getFiles = function(currentPath) {
      var files = [];

      fs.readdirSync(currentPath).forEach(file => {
        var filePath = path.join(currentPath, file);
        var stat = fs.lstatSync(filePath);

        if (stat.isDirectory()) {
          files.push({ name: file, type: 'dir', files: getFiles(filePath) });
        }
        else if (file.toLowerCase().indexOf('.md') >= 0 && file != '-index.md') {
          files.push({ name: file.slice(0, -3), type: 'file' });
        }
      });

      var fileFilter = f => !(f.type == 'dir' && f.files.filter(fileFilter).length == 0);

      return files.filter(fileFilter);
    }

    res.send(getFiles(config.docFolder));
  });

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

  app.get('*', (req, res) => {
    res.sendFile(__dirname + '/../client/dist/index.html');
  });

  app.listen(config.port, callback);
};

var startConfigServer = () => {
  var app = express();
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname + '/../client/dist/config.html'));
  });

  app.post('*', (req, res) => {
    if (!req.body.port || !req.body.authentication || !req.body.docFolder) {
      return res.sendStatus(400);
    }

    if (req.body.authentication == 'embedded' && (!req.body.rootUser || !req.body.rootPassword)) {
      return res.sendStatus(400);
    }

    var configContent = {
      port: req.body.port,
      docFolder: req.body.docFolder,
      tokenKey: Math.random().toString(36).substring(7)
    };

    if (req.body.authentication == 'embedded') {
      configContent.authentication = { type: 'embedded' };
    }

    fs.writeFile(__dirname + '/config.json', JSON.stringify(configContent, null, 2), 'utf8', () => {
      var config = require('./config.json');

      if (req.body.authentication == 'embedded') {
        require('./database').create(req.body.rootUser, req.body.rootPassword);
      }

      var redirectUrl = 'http://' + req.headers.host.substring(0, req.headers.host.indexOf(':')) + ':' + req.body.port + '/';

      res.send('<meta http-equiv="refresh" content="2; url=' + redirectUrl + '" />Restarting the server...');

      console.log('Closing Server...');
      server.kill(() => {
        console.log('Starting Server...');
        startServer();
      });
    });
  });

  var server = app.listen(4567);
  killable(server);
};

if (fs.existsSync(__dirname + '/config.json')) {
  startServer();
}
else {
  startConfigServer();
}
