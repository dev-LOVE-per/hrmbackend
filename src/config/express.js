const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const passport = require('passport');
const routes = require('../api/routes/v1');
const { logs } = require('./vars');
const strategies = require('./passport');
const error = require('../api/middlewares/error');
/**
* Express instance
* @public
*/
const app = express();

// request logging. dev: console | production: file
app.use(morgan(logs));

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// gzip compression
app.use(compress());

// lets you use HTTP verbs such as PUT or DELETE
// in places where the client doesn't support it
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// enable authentication
app.use(passport.initialize());
passport.use('jwt', strategies.jwt);
passport.use('facebook', strategies.facebook);
passport.use('google', strategies.google);

// mount api v1 routes
app.use('/v1', routes);

// connect docs folder
app.use(express.static(path.join(__dirname, '../../docs')));

// serve docs
app.use('/docs', (req, res) => {
  res.sendFile(path.join(__dirname, '../../docs/index.html'));
});

// connect frontend resources
app.use(express.static(path.join(__dirname, '../public')));

// serve docs
app.use('/one', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// http://localhost:3001/angular-ngrx-material-starter/assets/i18n/en.json
// serve docs
app.use('/angular-ngrx-material-starter/assets/i18n/:lang', (req, res) => {
  res.sendFile(path.join(__dirname, `../public/assets/i18n/${req.params.lang}`));
});

// http://localhost:3001/angular-ngrx-material-starter/assets/i18n/examples/de.json
app.use('/angular-ngrx-material-starter/assets/i18n/examples/:lang', (req, res) => {
  res.sendFile(path.join(__dirname, `../public/assets/i18n/examples/${req.params.lang}`));
});

// if error is not an instanceOf APIError, convert it.
app.use(error.converter);

// catch 404 and forward to error handler
app.use(error.notFound);

// error handler, send stacktrace only during development
app.use(error.handler);

module.exports = app;
