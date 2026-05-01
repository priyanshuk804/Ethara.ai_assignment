const Joi = require('joi');

const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('Admin', 'Member'),
  });
  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
};

const projectValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(''),
    members: Joi.array().items(Joi.string()),
  });
  return schema.validate(data);
};

const taskValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(''),
    status: Joi.string().valid('Todo', 'In Progress', 'Completed'),
    dueDate: Joi.date(),
    project: Joi.string().required(),
    assignedTo: Joi.string().allow('', null),
  });
  return schema.validate(data);
};

module.exports = {
  registerValidation,
  loginValidation,
  projectValidation,
  taskValidation,
};
