const mongoose = require('mongoose');
const Joi = require('joi');

const projectSchema = new mongoose.Schema({
  vereador: {
    type: String,
    required: true
  },
  partido: {
    type: String,
    required: true
  },
  sessao: {
    type: String,
    required: true
  },
  voto: {
    type: String,
    required: true
  },
});

const Project = mongoose.model('projects', projectSchema);

function validateProject(project) {
  const schema = {
    name: Joi.string().required()
  };

  return Joi.validate(project, schema);
}

exports.Project = Project;
exports.validate = validateProject;