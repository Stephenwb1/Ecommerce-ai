import Anthropic from "@anthropic-ai/sdk";
import { ChromaClient } from "chromadb";

const anthropic = new Anthropic();
const chroma = new ChromaClient();

interface EvalCase {
  question: string;
  expectedKeywords: string[];
}

const cases: EvalCase[] = [
  {
    question: "What is your return policy?",
    expectedKeywords: ["30 days", "30-day"],
  },
  {
    question: "How long does standard shipping take?",
    expectedKeywords: ["5", "7", "business days"],
  },
  {
    question: "Do you ship internationally?",
    expectedKeywords: ["Canada", "US"],
  },
  {
    question: "How much does shipping cost for a small order?",
    expectedKeywords: ["5.99", "$5"],
  },
  {
    question: "Do you have a leather jacket?",
    expectedKeywords: ["Leather Jacket", "leather jacket"],
  },
  {
    question: "What sizes does the Winter Parka come in?",
    expectedKeywords: ["S", "L", "XL"],
  },
  {
    question: "How do I make a warranty claim?",
    expectedKeywords: ["support@fakestore.com", "90"],
  },
  {
    question: "What payment methods do you accept?",
    expectedKeywords: ["Visa", "PayPal"],
  },
  {
    question: "How do I start a return?",
    expectedKeywords: ["support@fakestore.com"],
  },
  {
    question: "What happens if an item doesn't fit?",
    expectedKeywords: ["30 days", "30-day", "exchange", "return"],
  },
];

async function runRag(question: string): Promise<string> {
  const collection = await chroma.getCollection({ name: "store-knowledge" });
  const results = await collection.query({ queryTexts: [question], nResults: 5 });

  const chunks = results.documents[0] ?? [];
  const metadatas = results.metadatas[0] ?? [];
  const context = chunks
    .map((chunk, i) => {
      const source = (metadatas[i] as { source?: string })?.source ?? "unknown";
      return `[Source: ${source}]\n${chunk}`;
    })
    .join("\n\n---\n\n");

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 512,
    system: `You are a helpful customer support assistant for an online clothing store.
Answer the customer's question using ONLY the information provided in the context below.
If the answer is not in the context, say: "I don't have that information."
Do not make up information.

Context:
${context}`,
    messages: [{ role: "user", content: question }],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );
  return textBlock?.text ?? "";
}

async function main() {
  console.log("Running eval...\n");

  let passed = 0;

  for (let i = 0; i < cases.length; i++) {
    const { question, expectedKeywords } = cases[i];
    const reply = await runRag(question);

    const hit = expectedKeywords.some((kw) =>
      reply.toLowerCase().includes(kw.toLowerCase())
    );

    const status = hit ? "✓ PASS" : "✗ FAIL";
    if (hit) passed++;

    console.log(`[${i + 1}/${cases.length}] ${status}`);
    console.log(`  Q: ${question}`);
    if (!hit) {
      console.log(`  Expected one of: ${expectedKeywords.join(", ")}`);
      console.log(`  Got: ${reply.slice(0, 120)}...`);
    }
    console.log();
  }

  console.log(`Score: ${passed}/${cases.length}`);
}

main();
