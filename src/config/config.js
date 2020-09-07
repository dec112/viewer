import dev from './config.dev';
import prod from './config.prod';

import pack from '../../package.json';

export default process.env.NODE_ENV === 'production' ? prod : dev;

export const PACKAGE = pack;