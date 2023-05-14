//import * as tf from '@tensorflow/tfjs'
import { PineconeClient } from "@pinecone-database/pinecone";

async function main() {
    const pinecone = new PineconeClient();
    await pinecone.init({
        environment: "us-east-1-aws",
        apiKey: "83d5fc94-5fd6-4d8a-ba7e-f7187ae79846",
    })

    await pinecone.createIndex({
      createRequest: {
        name: "example-index",
        dimension: 1024,
      },
    });

const index = pinecone.Index("example-index");
const upsertRequest = {
  vectors: [
    {
      id: "vec1",
      values: [0.1, 0.2, 0.3, 0.4],
      metadata: {
        genre: "drama",
      },
    },
    {
      id: "vec2",
      values: [0.2, 0.3, 0.4, 0.5],
      metadata: {
        genre: "action",
      },
    },
  ],
  namespace: "example-namespace",
};
const upsertResponse = await index.upsert({ upsertRequest });
console.log(upsertResponse);
    
}

main();