import fs from "fs";
import path from "path";
import { ChromaClient } from "chromadb";

const chroma = new ChromaClient();

// Load data files
const dataDir = path.join(process.cwd(), "data");

const productsRaw = fs.readFileSync(path.join(dataDir, "products.json"), "utf-8");
const products = JSON.parse(productsRaw);

const faq = fs.readFileSync(path.join(dataDir, "faq.md"), "utf-8");
const policies = fs.readFileSync(path.join(dataDir, "policies.md"), "utf-8");

// Convert each product to a descriptive string
const productTexts: { text: string; source: string }[] = products.map((p: any) => ({
  text: `Product: ${p.name}. Price: $${p.price}. Sizes: ${p.sizes.join(", ")}. ${p.description}`,
  source: "products.json",
}));

// Split text into overlapping chunks
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let i = 0;

  while (i < words.length) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    chunks.push(chunk);
    i += chunkSize - overlap;
  }

  return chunks;
}

const faqChunks = chunkText(faq, 500, 50).map((text) => ({ text, source: "faq.md" }));
const policyChunks = chunkText(policies, 500, 50).map((text) => ({ text, source: "policies.md" }));

const allChunks = [...productTexts, ...faqChunks, ...policyChunks];

async function main() {
  // Clear and recreate the collection so re-runs don't duplicate data
  try {
    await chroma.deleteCollection({ name: "store-knowledge" });
  } catch {
    // Collection didn't exist yet, that's fine
  }
  // No embedding function specified — ChromaDB uses its built-in local model
  const collection = await chroma.getOrCreateCollection({ name: "store-knowledge" });

  console.log(`Storing ${allChunks.length} chunks...`);

  for (let i = 0; i < allChunks.length; i++) {
    const { text, source } = allChunks[i];

    await collection.add({
      ids: [`chunk_${i}`],
      documents: [text],
      metadatas: [{ source }],
    });

    console.log(`[${i + 1}/${allChunks.length}] ${source}`);
  }

  console.log("Done! All chunks stored in ChromaDB.");
}

main();
