import mongoose from "mongoose";
import env_config from "./configurations";

class MongoConn {
  public static conn: mongoose.Connection = mongoose.createConnection(env_config.db_string);
}

export default MongoConn;