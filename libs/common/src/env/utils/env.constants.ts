import * as Joi from 'joi';

export const ENV_VALIDATION_SCHEMA = Joi.object({
  DATABASE_URL: Joi.required(),
  JWT_SECRET: Joi.required(),
  JWT_TTL: Joi.required(),
  OTP_APP_ID: Joi.required(),
  OTP_AUTH_KEY: Joi.required(),
  API_URL: Joi.required(),
  API_URL_MOMO_MTN: Joi.required(),
  API_MODE_MOMO_MTN: Joi.required(),
  API_USER_MOMO_MTN: Joi.required(),
  API_KEY_MOMO_MTN: Joi.required(),
  OCP_APIM_SUBSCRIPTION_KEY_COLLECTION: Joi.required(),
  OCP_APIM_SUBSCRIPTION_KEY_DISBURSEMENTS: Joi.required(),
});
