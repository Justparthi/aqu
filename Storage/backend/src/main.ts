import express from 'express';
import cors from 'cors';

import router from './router';
import env_config from './configurations';
import MongoConn from './mongo_conn_handler';

import dotenv from 'dotenv';

dotenv.config();

/* CORS Options */
const corsOptions = {
  origin: (origin: any, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      // Allow requests with no origin like Postman or curl
      return callback(null, true);
    }

    try {
      const hostname = new URL(origin).hostname;

      if (
        hostname === 'aquesa-solutions.com' ||
        hostname.endsWith('.aquesa-solutions.com') ||
        hostname === 'localhost'
      ) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'), false);
      }
    } catch (err) {
      callback(new Error('CORS origin block'), false);
    }
  },
  credentials: true,
};

/* Express init and middleware setup. */
const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use('/api', router);

/* API server. */
const server = app.listen(env_config.port, () => {
  console.log(`Server is running at: http://localhost:${env_config.port}/api`);
  console.log(process.env.GCP_API_KEY);
});

/* MongoDB connection. */
const conn = MongoConn.conn;

/* Reconnection handler for DB. */
const db_reconnection_handler = () => {
  console.log("MongoDB got disconnected. Trying to reconnect.");
};

/* Error handler for DB. */
const db_error_handler = () => {
  server.close();
  console.log("MongoDB got disconnected. Server got closed.");
};

/* Process close handler. */
const process_close_handler = () => {
  server.close();
  conn.close();
  console.log("Server got closed successfully");
};

/* MongoDB handler. callbacks */
conn.on('connected', () => {
  console.log("Connected to MongoDB successfully.");
});

['disconnecting', 'reconnected'].forEach(event => {
  conn.on(event, db_reconnection_handler);
});

['disconnected', 'close'].forEach(event => {
  conn.on(event, db_error_handler);
});

conn.on('error', (err) => {
  console.log(err);
  db_error_handler();
});

/* Process interruption signal handlers. */
["SIGINT", "SIGTERM", "exit"].forEach(signal => {
  process.on(signal, process_close_handler);
});
