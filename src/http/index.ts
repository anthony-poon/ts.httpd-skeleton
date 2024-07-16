import env from '../env';
import ExpressHttp from './impl/express';

const http = new ExpressHttp(env);

export default http;
