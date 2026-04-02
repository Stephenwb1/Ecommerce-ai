import { ChromaClient } from "chromadb";

const chroma = new ChromaClient();

async function main() {
  const collection = await chroma.getCollection({ name: "store-knowledge" });

  const results = await collection.query({
    queryTexts: ["what is your return policy?"],
    nResults: 3,
  });

  console.log(results.documents);
  console.log(results.metadatas);
}

main();
