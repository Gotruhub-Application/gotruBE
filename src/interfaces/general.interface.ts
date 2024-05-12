import mongoose, { Schema, Document } from 'mongoose';

export interface BlackListedTokenDocument extends Document {
  token: string
}

// export interface IAppTokenTasks extends Document {
//   appToken: Schema.Types.ObjectId,
//   date:Date,
//   done: boolean

// }
