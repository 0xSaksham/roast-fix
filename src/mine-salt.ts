// src/mine-salt.ts
async function mine() {
    // This is the address we got from your private key earlier
    const agentWalletAddress = "0x89d527660a57b665f90378d388d6f2559c387796";

    // The correct Testnet URL from AGENTS.md for Nad.fun
    const NAD_FUN_API = "https://dev-api.nad.fun";

    console.log(`⛏️ Mining vanity salt for RoastFix...`);
    console.log(`Address: ${agentWalletAddress}`);

    try {
        const response = await fetch(`${NAD_FUN_API}/agent/salt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                address: agentWalletAddress,
                name: "RoastFix",
                symbol: "ROAST"
            })
        });

        const text = await response.text();

        if (!response.ok) {
            console.error(`❌ Server Error (${response.status}):`, text);
            return;
        }

        const data = JSON.parse(text);
        console.log("✅ Salt Found:", data.salt);
        console.log("🎯 Future Token Address:", data.address);
        console.log("\nCopy this salt into your .env as SALT=");
    } catch (error) {
        console.error("❌ Request failed:", error);
    }
}

mine();
