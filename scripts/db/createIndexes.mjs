#!/usr/bin/env node
import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "thearchitect";
if (!uri) {
  console.error("MONGODB_URI not set");
  process.exit(1);
}

const client = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true } });

async function main(){
  await client.connect();
  const db = client.db(dbName);
  const Messages = db.collection("messages");
  const Conversations = db.collection("conversations");
  const FeedbackLog = db.collection("FeedbackLog");

  await Messages.createIndex({ conversation_id: 1, timestamp: 1 });
  await Messages.createIndex({ brand_id: 1, conversation_id: 1 });
  await Conversations.createIndex({ brand_id: 1, started_at: 1 });
  await FeedbackLog.createIndex({ brand: 1, region: 1, persona: 1, createdAt: -1 });
  await FeedbackLog.createIndex({ sessionId: 1, createdAt: -1 });

  console.log("Indexes ensured on messages, conversations, and FeedbackLog");
}

main().then(()=>client.close()).catch((e)=>{ console.error(e); process.exit(1); });
