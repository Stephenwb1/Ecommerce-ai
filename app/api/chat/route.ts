import Anthropic from "@anthropic-ai/sdk";
import { ChromaClient } from "chromadb";
import fs from "fs";
import path from "path";

const anthropic = new Anthropic();
const chroma = new ChromaClient();

export async function POST(request: Request) {
  const { message } = await request.json();

  if (!message || typeof message !== "string") {
    return Response.json({ error: "message is required" }, { status: 400 });
  }

  // Retrieve the top 5 relevant chunks from ChromaDB
  const collection = await chroma.getCollection({ name: "store-knowledge" });
  const results = await collection.query({
    queryTexts: [message],
    nResults: 5,
  });

  const chunks = results.documents[0] ?? [];
  const metadatas = results.metadatas[0] ?? [];

  // Build context with source labels so Claude can cite them
  const context = chunks
    .map((chunk, i) => {
      const source = (metadatas[i] as { source?: string })?.source ?? "unknown";
      return `[Source: ${source}]\n${chunk}`;
    })
    .join("\n\n---\n\n");

  const system = `You are a helpful customer support assistant for an online clothing store.
Answer the customer's question using ONLY the information provided in the context below.
If the answer is not in the context, say: "I don't have that information — please contact us at support@fakestore.com and we'll be happy to help."
Do not make up information. If a customer asks about their order, use the lookup_order tool to get the current status.
At the end of your answer, add a line that says "Source: " followed by the source file name(s) you used (e.g. "Source: faq.md").

Context:
${context}`;

  const tools: Anthropic.Tool[] = [
    {
      name: "lookup_order",
      description: "Look up the status of a customer order by order ID.",
      input_schema: {
        type: "object",
        properties: {
          order_id: {
            type: "string",
            description: "The order ID to look up",
          },
        },
        required: ["order_id"],
      },
    },
  ];

  const userMessages: Anthropic.MessageParam[] = [
    { role: "user", content: message },
  ];

  // First Claude call
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system,
    messages: userMessages,
    tools,
  });

  // If Claude wants to call a tool, handle it
  if (response.stop_reason === "tool_use") {
    const toolUseBlock = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );

    if (toolUseBlock && toolUseBlock.name === "lookup_order") {
      const { order_id } = toolUseBlock.input as { order_id: string };

      // Load orders and find the matching order
      const ordersPath = path.join(process.cwd(), "data", "orders.json");
      const orders = JSON.parse(fs.readFileSync(ordersPath, "utf-8"));
      const order = orders.find((o: { id: string }) => o.id === order_id);
      const toolResult = order
        ? JSON.stringify(order)
        : `No order found with ID ${order_id}.`;

      // Second Claude call with the tool result
      const finalResponse = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        system,
        messages: [
          ...userMessages,
          { role: "assistant", content: response.content },
          {
            role: "user",
            content: [
              {
                type: "tool_result",
                tool_use_id: toolUseBlock.id,
                content: toolResult,
              },
            ],
          },
        ],
        tools,
      });

      const finalText = finalResponse.content.find(
        (block): block is Anthropic.TextBlock => block.type === "text"
      );
      return Response.json({ reply: finalText?.text ?? "" });
    }
  }

  // Claude answered directly without using a tool
  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );
  return Response.json({ reply: textBlock?.text ?? "" });
}
