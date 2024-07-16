import express from 'express';
import Joi from 'joi';

import authentication from '../../service/authenication';

const authRoute = express.Router();

const GET_TOKEN_SCHEMA = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const REGISTRATION_SCHEMA = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const RESET_PASSWORD_SCHEMA = Joi.object({
  password: Joi.string().required(),
});

const REQUEST_EMAIL_CONFIRMATION_SCHEMA = Joi.object({
  email: Joi.string().email().required(),
});

const REQUEST_RESET_PASSWORD_SCHEMA = Joi.object({
  email: Joi.string().email().required(),
});

authRoute.post('/tokens', async (req, res, next) => {
  try {
    Joi.assert(req.body, GET_TOKEN_SCHEMA);
    const { username, password } = req.body;
    const auth = await authentication.authenticate(username, password);
    const token = authentication.dehydrate(auth);
    res.json({
      token,
    });
  } catch (e) {
    next(e);
  }
});

authRoute.post('/registration', async (req, res, next) => {
  try {
    Joi.assert(req.body, REGISTRATION_SCHEMA);
    const { username, email, password } = req.body;
    await authentication.registration(username, email, password);
    res.json({
      success: true,
    });
  } catch (e) {
    next(e);
  }
});

authRoute.post('/confirmation', async (req, res, next) => {
  try {
    Joi.assert(req.body, REQUEST_EMAIL_CONFIRMATION_SCHEMA);
    const { email } = req.body;
    await authentication.resendEmailConfirmation(email);
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
});

authRoute.post('/confirmation/:tokenValue', async (req, res, next) => {
  try {
    const { tokenValue } = req.params;
    await authentication.confirmEmail(tokenValue);
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
});

authRoute.post('/reset-password', async (req, res, next) => {
  try {
    Joi.assert(req.body, REQUEST_RESET_PASSWORD_SCHEMA);
    const { email } = req.body;
    await authentication.requestResetPassword(email);
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
});

authRoute.post('/reset-password/:tokenValue', async (req, res, next) => {
  try {
    Joi.assert(req.body, RESET_PASSWORD_SCHEMA);
    const { tokenValue } = req.params;
    const { password } = req.body;
    await authentication.resetPassword(tokenValue, password);
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
});

export default authRoute;
