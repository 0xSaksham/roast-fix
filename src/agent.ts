import { ethers } from "ethers";
import Groq from "groq-sdk";

interface RoastAnalysis {
  roast: string;
  fix: string;
  severity: "LOW" | "MEDIUM" | "CRITICAL";
}

const groq = new Groq({ apiKey: Bun.env.GROQ_API_KEY });
const provider = new ethers.JsonRpcProvider(Bun.env.MONAD_RPC_URL);
const wallet = new ethers.Wallet(Bun.env.AGENT_PRIVATE_KEY!, provider);

async function generateRoast(txHash: string, inputData: string): Promise<RoastAnalysis> {
  const prompt = `
    You are RoastFix, a savage Solidity auditor.
    Analyze this failed tx: ${txHash}
    Input Data: ${inputData}

    Rules:
    1. Be funny but technically accurate.
    2. Provide a valid Solidity fix.
    3. Determine severity.

    Respond ONLY in JSON format:
    {
      "roast": "string",
      "fix": "string",
      "severity": "LOW" | "MEDIUM" | "CRITICAL"
    }
  `;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "system", content: "You are a toxic senior developer." }, { role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message.content;
  if (!content) {
    throw new Error("No response content from Groq API");
  }
  return JSON.parse(content) as RoastAnalysis;
}

async function watchMonad() {
  console.log("🚀 RoastFix is live on Monad Testnet (Bun + TS)...");

  provider.on("block", async (blockNumber: number) => {
    const block = await provider.getBlock(blockNumber, true);
    if (!block) return;

    console.log(`Checking block #${blockNumber}...`);

    for (const tx of block.prefetchedTransactions) {
      try {
        const receipt = await provider.getTransactionReceipt(tx.hash);

        if (receipt && receipt.status === 0) {
          console.log(`\n🚨 Failure Detected: ${tx.hash}`);

          const analysis = await generateRoast(tx.hash, tx.data);

          console.log(`💀 ROAST [${analysis.severity}]: ${analysis.roast}`);
          console.log(`🔧 FIX: ${analysis.fix}`);
          console.log(`💰 BUY $ROAST: https://nad.fun/token/${Bun.env.TOKEN_ADDRESS}\n`);
        }
      } catch (e) {
      }
    }
  });
}

watchMonad();
