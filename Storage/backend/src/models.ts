import mongoose, { Schema } from "mongoose";
import MongoConn from "./mongo_conn_handler";

/* User Schema */
const userSchema: Schema = new Schema({
  uid: {
    type: Schema.Types.String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: Schema.Types.String,
    required: true,
    unique: true
  },
  displayName: {
    type: Schema.Types.String,
    required: true
  },
  currency: {
    type: Schema.Types.String,
    required: true
  },
  joiningDate: {
    type: Schema.Types.Date,
    default: () => Date.now()
  },
  blobs: {
    type: Schema.Types.Array,
    default: []
  }
},

  { timestamps: true }
)

/* Waitlist schema */
const waitlistSchema: Schema = new Schema({
  uid: {
    type: Schema.Types.String,
    unique: true,
    index: true,
    required: true,
  },
  email: {
    type: Schema.Types.String,
    required: true
  }
},

  { timestamps: true }
)

/* Bill Schema */
const billSchema: Schema = new Schema({
  uid: {
    type: Schema.Types.String,
    unique: true,
    index: true,
    required: true
  },
  amount: {
    type: Schema.Types.Number,
    required: true
  },
  currency: {
    type: Schema.Types.String,
    required: true
  },
  date: {
    type: Schema.Types.Date,
    default: () => Date.now()
  }
},
  {timestamps: true}
)

const conn = MongoConn.conn;

const User = conn.model('User', userSchema);
const Waitlist = conn.model('Waitlist', waitlistSchema);
const Bill = conn.model('Bill', billSchema);

/* Exporing the schemas. */
export {
  User,
  Waitlist,
  Bill
}