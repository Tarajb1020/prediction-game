const admin = require("firebase-admin");

// 1. FIREBASE INITIALIZATION
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://winzone-bff7c-default-rtdb.firebaseio.com"
});

const db = admin.database();

console.log("📡 Win Zone Core Engine: ACTIVE");
console.log("🎮 Automated Wingo Loop Started (With 15s Advance Prediction)...");

// 2. CONFIGURATION: Har round ka total time (Seconds me)
const ROUND_DURATION = 60; // 1-Minute Game (Agar 3 minute karni ho to 180 kar dein)
let countdown = ROUND_DURATION;
let nextRoundOutcome = null;

// Har 1 second baad chalne wala Core Loop
setInterval(() => {
  countdown--;

  // 🔴 THREK 15 SECOND PEHLE PREVIEW CALCULATE HOGA
  if (countdown === 15) {
    // Random number 0 se 9 ke darmiyan
    const randomNumber = Math.floor(Math.random() * 10);
    
    // Size Filter (5-9 Big, 0-4 Small)
    const size = randomNumber >= 5 ? "Big" : "Small";
    
    // Color Selector
    let color = "";
    if (randomNumber === 0) {
      color = "Red-Violet";
    } else if (randomNumber === 5) {
      color = "Green-Violet";
    } else if ([1, 3, 7, 9].includes(randomNumber)) {
      color = "Green";
    } else {
      color = "Red";
    }

    // Aapka complete locked outcome object
    nextRoundOutcome = {
      num: randomNumber,
      size: size,
      color: color,
      message: `Round Outcome Locked: ${size} (${randomNumber})`,
      round_start: Date.now()
    };

    // Database me push -> Yeh direct aapke admin panel ko 15 second pehle show kar dega
    db.ref("admin_controls/auto_preview").set(nextRoundOutcome)
      .then(() => console.log("🎯 Advance Result Generated & Pushed to Database: ", nextRoundOutcome.message))
      .catch((err) => console.error("❌ DB Push Error:", err.message));
  }

  // 🏁 JAB ROUND KHATAM HO JAYE (0 SECONDS)
  if (countdown <= 0) {
    console.log("🏁 Round Finished. Saving to History and Restarting...");
    
    if (nextRoundOutcome) {
      // 1. Users ke liye live data update karein jo unki screen par jaye
      db.ref("wingo_current_round").set({
        num: nextRoundOutcome.num,
        size: nextRoundOutcome.size,
        color: nextRoundOutcome.color,
        timestamp: Date.now()
      });

      // 2. Game history record me save karein taake pichla record save rahe
      db.ref("wingo_history").push().set({
        num: nextRoundOutcome.num,
        size: nextRoundOutcome.size,
        color: nextRoundOutcome.color,
        time: new Date().toLocaleTimeString()
      });
    }

    // Timer dobara shuru
    countdown = ROUND_DURATION;
  }

}, 1000);

// 3. DEPOSIT & WITHDRAW MANAGEMENT DIRECT DATABASE TRACKING
// Chunkay aap direct database se deposits handle karte hain, to server background me incoming records log karega
db.ref("deposit_requests").on("child_added", (snapshot) => {
    const request = snapshot.val();
    if (request && request.status === "pending") {
        console.log(`💰 New Pending Deposit Detected in DB! User: ${request.phone} | Amount: ${request.amount} | TRID: ${request.trxId}`);
    }
});
