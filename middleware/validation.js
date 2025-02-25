const Joi = require("joi");

// User profile update validation
exports.validateProfileUpdate = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).optional(),
    email: Joi.string().email().optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  next();
};

// Post creation validation
exports.validatePost = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(100).required(),
    content: Joi.string().min(10).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  next();
};