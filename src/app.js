import 'dotenv/config.js';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import express from 'express';
import cors from 'cors';
import passport from 'passport';

import './services/auth/jwt-strategy.js';
import './services/auth/local-strategy.js';
import './services/auth/google-strategy.js';
import './services/auth/facebook-strategy.js';

import funcionarioRouter from './routers/funcionarioRouter.js';
import usuarioRouter from './routers/usuarioRouter.js';
import catalogoRouter from './routers/catalogoRouter.js';

const app = express();

// middleware
app.use(
  cors({ origin: JSON.parse(process.env.CORS_ORIGINS || '["*"]') }),
  morgan('dev'),
  express.json(),
  express.urlencoded({ extended: false }),
  cookieParser(),
  passport.initialize(),
);

// controllers
app.use('/funcionario', funcionarioRouter);
app.use('/usuario', usuarioRouter);
app.use('/catalogo', catalogoRouter);

app.use((req, res, next) => {
  res.status(404).json({
    message: 'pagina não encontrada',
  });
});

app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({
    message: 'erro desconhecido',
    error,
  });
});

export default app;
