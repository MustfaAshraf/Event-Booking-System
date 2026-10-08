import express from 'express';
import { config } from './src/config/env.js';
import { dbConnection } from './src/DB/connection.js';
import { bootstrap } from './src/app.js';

const app = express();

await dbConnection();
bootstrap(app);

app.listen(config.PORT, () => {
    console.log(`🚀 Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
});