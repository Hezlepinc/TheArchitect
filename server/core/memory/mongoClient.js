import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
const defaultDbName = process.env.MONGODB_DB || "thearchitect";

let cachedClient = null;
let connectingPromise = null;

export async function getMongoClient() {
  if (cachedClient) return cachedClient;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!connectingPromise) {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    connectingPromise = client.connect().then((c) => {
      cachedClient = c;
      return c;
    });
  }
  return connectingPromise;
}

export async function getDb(dbName = defaultDbName) {
  const client = await getMongoClient();
  return client.db(dbName);
}

export async function getCollection(name, dbName = defaultDbName) {
  const db = await getDb(dbName);
  return db.collection(name);
}

export async function pingMongo() {
  const db = await getDb();
  await db.admin().command({ ping: 1 });
  return true;
}
