const express = require('express');
const router = express.Router();
const { Project } = require('../models/project');

router.get('/', async (req, res) => {
  const projects = await Project.find();

  res.send(projects);
});

router.get('/categories/:name', async (req, res) => {
  const projects = await Project.find({"categories.name": { $regex : req.params.name }})

  res.send(projects);
});

module.exports = router;