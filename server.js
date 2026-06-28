const admin = require("firebase-admin");
const TelegramBot = require("node-telegram-bot-api");

// 1. FIREBASE INITIALIZATION
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://winzone-bff7c-default-rtdb.firebaseio.com"
});

const db = admin.database();

// 2. TELEGRAM CONFIGURATION (Aapki details perfect set hain)
const TELEGRAM_TOKEN = "8854952702:AAFEJrRKpYI8up9CdtGeA5LSKMzeHKNq2Zg"; 
const ADMIN_CHAT_ID = 8608893352; 

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

console.log("📡 Win Zone Bridge Engine Status: ACTIVE");
console.log("🤖 Listening for new pending deposits in Firebase...");

// 3. REAL-TIME DATA LOG TRACKER
db.ref("deposit_requests").on("child_added", (snapshot) => {
    const request = snapshot.val();
    const requestId = snapshot.key;

    // Sirf pending deposit requests ko uthana
    if (request && request.status === "pending") {
        
        const message = `⚠️ *NEW INCOMING DEPOSIT REQUEST* ⚠️\n\n` +
                        `📱 *User Phone:* ${request.phone || "N/A"}\n` +
                        `📧 *Email Address:* ${request.email || "N/A"}\n` +
                        `💰 *Requested Amount:* PKR ${request.amount}\n` +
                        `🔑 *Transaction TRID:* \`${request.trxId}\`\n` +
                        `👤 *User Unique UID:* \`${request.uid}\`\n\n` +
                        `📝 *System Action:* Request ID \`${requestId}\` updated in cloud db.`;

        // Telegram Message Delivery
        bot.sendMessage(ADMIN_CHAT_ID, message, { parse_mode: "Markdown" })
        .then(() => {
            console.log(`✅ Telegram alert sent successfully for TRID: ${request.trxId}`);
        })
        .catch((err) => {
            console.error("❌ Telegram Delivery Failed:", err.message);
        });
    }
});
