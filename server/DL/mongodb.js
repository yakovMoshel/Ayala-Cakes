// server/DL/mongodb.js
import { MongoClient } from 'mongodb'

const uri = process.env.MONGO_URI
const options = {}

let client
let clientPromise

if (!uri) throw new Error('חובה להגדיר MONGODB_URI בסביבה')

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise