// tests/testMongo.js
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";

// Load env from server/.env
dotenv.config();;

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri) {
    console.error("❌ MONGODB_URI is not set in .env");
    process.exit(1);
  }

  console.log("🔌 Connecting to MongoDB...");
  console.log("URI:", uri.replace(/\/\/.*@/, "//<credentials>@")); // hide user/pass

  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    console.log("✅ Connected successfully");

    const db = client.db(dbName);
    console.log("📂 Using database:", dbName);

    const collections = await db.listCollections().toArray();
    if (collections.length) {
      console.log("📦 Collections:", collections.map(c => c.name).join(", "));
    } else {
      console.log("📦 No collections yet (empty db).");
    }

    await client.close();
    console.log("🔒 Connection closed");
  } catch (err) {
    console.error("❌ MongoDB connection failed");
    console.error("Reason:", err.message);
    process.exit(1);
  }
}

main();