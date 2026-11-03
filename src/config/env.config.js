import dotenv from 'dotenv';
dotenv.config();

const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  jwt: Object.freeze({
    secret: process.env.JWT_SECRET,
  }),
});

export default env;
