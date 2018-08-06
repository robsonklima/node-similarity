const express = require('express');
const error = require('../middleware/error');
const projects = require('../routes/projects');
const users = require('../routes/users');
const auth = require('../routes/auth');

module.exports = function (app) {
  app.use(express.json());
  app.use('/api/projects', projects);
  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use(error);
}