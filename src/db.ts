import mongoose from 'mongoose'
import * as dotenv from 'dotenv'
import { logger } from "./logger";


dotenv.config()
class Database {
   private static _database: Database
   private constructor() {
      const dbUrl = process.env.MONGO_URL
         if(dbUrl) {
            mongoose.connect(dbUrl)
               .then(() => logger.info('Connected with database'))
               .catch(() => logger.info('Not connected with database'))
         }
   }
   static getInstance() {
      if (this._database) {
         return this._database
      }
      this._database = new Database()
      return this._database = new Database()
   }
}
export default Database