import { Pinecone } from "@pinecone-database/pinecone";

let pineconeClient = null;
let pineconeIndex = null;

export function getPineconeClient() {
  if (pineconeClient) return pineconeClient;
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) return null;
  pineconeClient = new Pinecone({ apiKey });
  return pineconeClient;
}

export function getPineconeIndex() {
  if (pineconeIndex) return pineconeIndex;
  const client = getPineconeClient();
  const indexName = process.env.PINECONE_INDEX;
  if (!client || !indexName) return null;
  pineconeIndex = client.Index(indexName);
  return pineconeIndex;
}
