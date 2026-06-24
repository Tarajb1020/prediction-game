const express = require('express');
const app = express();
app.use(express.json());

// Fake Database (Shuru me check karne ke liye)
let currentRound = {
    roundId: "20260624001",
    totalRedBets: 0,
    totalGreenBets: 0,
    status: "OPEN" // OPEN, CALCULATING, CLOSED
};

// 1. User ke bet lagane ki setting
app.post('/api/place-bet', (req, res) => {
    const { userId, color, amount } = req.body;
    
    if (currentRound.status !== "OPEN") {
        return res.status(400).json({ error: "Round closed! Wait for next round." });
    }

    if (color === 'Red') currentRound.totalRedBets += amount;
    if (color === 'Green') currentRound.totalGreenBets += amount;

    res.json({ success: true, message: "Bet placed successfully!", currentRound });
});

// 2. ADMIN PANEL LOGIC (Jo automatic sab se kam paise wale ko jitayega)
app.get('/api/calculate-winner', (req, res) => {
    let winner = "";
    
    // Core Logic: Jis par kam paisa laga, wo jeet gaya
    if (currentRound.totalRedBets < currentRound.totalGreenBets) {
        winner = "Red";
    } else if (currentRound.totalGreenBets < currentRound.totalRedBets) {
        winner = "Green";
    } else {
        // Agar barabar paisa ho to random nikal lo
        winner = Math.random() > 0.5 ? "Red" : "Green";
    }

    const roundResult = {
        roundId: currentRound.roundId,
        winner: winner,
        totalPool: currentRound.totalRedBets + currentRound.totalGreenBets,
        adminProfit: (currentRound.totalRedBets + currentRound.totalGreenBets) * 0.10 // 10% Admin ka safe profit
    };

    // New Round Reset Settings
    currentRound = {
        roundId: String(Number(currentRound.roundId) + 1),
        totalRedBets: 0,
        totalGreenBets: 0,
        status: "OPEN"
    };

    res.json({ message: "Round Finished!", result: roundResult });
});

// Server standard port par chalane ke liye
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Game engine running on port ${PORT}`));