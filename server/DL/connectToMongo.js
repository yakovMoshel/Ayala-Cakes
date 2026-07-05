import mongoose from "mongoose";
import dns from "dns";

// Cache the connection promise across hot reloads / serverless invocations so
// parallel callers share one connection attempt instead of racing.
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { promise: null, dnsFallbackApplied: false };
}

const connect = () =>
  mongoose.connect(process.env.MONGO_URI, {
    // Fail fast with the real connection error instead of letting queries
    // buffer for 10s and throw an opaque "buffering timed out" error
    serverSelectionTimeoutMS: 10000,
  });

const attemptConnection = async () => {
  try {
    return await connect();
  } catch (error) {
    // Dev-machine workaround: mongodb+srv:// needs an SRV DNS lookup, and Node
    // (unlike Windows itself) won't fall back when the primary DNS server
    // (e.g. a dead 127.0.0.1 resolver) refuses the query. Retry once via
    // public DNS before giving up.
    const srvRefused = error?.syscall === "querySrv" && error?.code === "ECONNREFUSED";
    if (srvRefused && !cached.dnsFallbackApplied) {
      cached.dnsFallbackApplied = true;
      console.warn("MongoDB SRV lookup refused by system DNS; retrying with public DNS (1.1.1.1, 8.8.8.8)");
      dns.setServers(["1.1.1.1", "8.8.8.8"]);
      return await connect();
    }
    throw error;
  }
};

export const connectToMongo = async () => {
  if (mongoose.connection.readyState === 1) return;

  if (!cached.promise) {
    cached.promise = attemptConnection()
      .then((m) => {
        console.log("Connected to MongoDB (Mongoose)");
        return m;
      })
      .catch((error) => {
        // Allow the next request to retry instead of caching the failure
        cached.promise = null;
        throw error;
      });
  }

  await cached.promise;
};
