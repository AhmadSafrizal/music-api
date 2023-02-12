const Joi = require('joi');

const ExportOpenMusicPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = ExportOpenMusicPayloadSchema;
