import Joi from 'joi';

export const createPublishDto = Joi.object({
  id: Joi.number().required()
});

export const findPublishDto = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
});