const admin = require("firebase-admin");
const TelegramBot = require("node-telegram-bot-api");

// 1. FIREBASE INITIALIZATION
// Yaad se apni private key JSON file ka naam "serviceAccountKey.json" rakh kar isi folder mein daal dein.
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://winzone-bff7c-default-rtdb.firebaseio.com"
});

const db = admin.database();

// 2. TELEGRAM SETTINGS (Aapka Token Set Kar Diya Hai)
const TELEGRAM_TOKEN = "8854952702:AAFEJrRKpYI8up9CdtGeA5LSKMzeHKNq2Zg"; 

// ⚠️ BAS YAHAN APNI CHAT ID YA GROUP ID REPIACE KAREIN (BINA QUOTES KE NUMBERS LIKHEIN)
const ADMIN_CHAT_ID = 123456789; 

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

console.log("📡 Win Zone Bridge Engine Status: ACTIVE");
console.log("🤖 Listening for new pending deposits in Firebase...");

// 3. REAL-TIME DATA STREAM TO TELEGRAM
db.ref("deposit_requests").on("child_added", (snapshot) => {
    const request = snapshot.val();
    const requestId = snapshot.key;

    // Sirf pending requests ko catch karna
    if (request && request.status === "pending") {
        
        const message = `⚠️ *NEW INCOMING DEPOSIT REQUEST* ⚠️\n\n` +
                        `📱 *User Phone:* ${request.phone || "N/A"}\n` +
                        `📧 *Email Address:* ${request.email || "N/A"}\n` +
                        `💰 *Requested Amount:* PKR ${request.amount}\n` +
                        `🔑 *Transaction TRID:* \`${request.trxId}\`\n` +
                        `👤 *User Unique UID:* \`${request.uid}\`\n\n` +
                        `📝 *System Action:* Open Admin Panel to process request ID: \`${requestId}\``;

        // Message forwarding to your bot
        bot.sendMessage(ADMIN_CHAT_ID, message, { parse_mode: "Markdown" })
        .then(() => {
            console.log(`✅ Telegram alert sent successfully for TRID: ${request.trxId}`);
        })
        .catch((err) => {
            console.error("❌ Telegram Delivery Failed:", err.message);
        });
    }
});
