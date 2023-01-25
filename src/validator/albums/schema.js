const Joi = require('joi');

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  // eslint-disable-next-line newline-per-chained-call
  year: Joi.number().integer().min(1970).max(new Date().getFullYear()).required(),
});

module.exports = { AlbumPayloadSchema };
