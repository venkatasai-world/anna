// import express from "express";
// import dotenv from "dotenv";
// import Groq from "groq-sdk";
// import Chat from "../models/Chat.js";
// import auth from "../middleware/auth.js";
// import { v4 as uuidv4 } from "uuid";  // For unique session IDs

// dotenv.config();

// const router = express.Router();
// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// // Start new chat session
// router.post("/start", auth, async (req, res) => {
//   const sessionId = uuidv4(); // unique session
//   res.json({ sessionId });
// });



// router.get("/sessions/all", auth, async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     // get all sessions for user
//     const sessions = await Chat.aggregate([
//       { $match: { userId } },

//       // sort by time
//       { $sort: { createdAt: 1 } },

//       // group by session and pick first user message
//       {
//         $group: {
//           _id: "$sessionId",
//           firstMessage: { $first: "$content" },
//         }
//       },

//       { $sort: { _id: -1 } }  // newest first
//     ]);

//     res.json(sessions);

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// // Send message route
// router.post("/:sessionId", auth, async (req, res) => {
//   try {
//     const { message } = req.body;
//     const { sessionId } = req.params;
//     const userId = req.user.userId;

//     if (!message) return res.status(400).json({ error: "Message required" });

//     // Save user message
//     await Chat.create({ sessionId, userId, role: "user", content: message });

//     // AI response
//     const response = await groq.chat.completions.create({
//       model: "llama-3.1-8b-instant",  // Replace with a currently supported model
//       messages: [{ role: "user", content: message }]
//     });

//     const aiReply = response.choices[0].message.content;

//     // Save AI reply
//     await Chat.create({ sessionId, userId, role: "assistant", content: aiReply });

//     res.json({ reply: aiReply });

//   } catch (error) {
//     console.error("AI Error =>", error);
//     res.status(500).json({ error: "AI Error", details: error.message });
//   }
// });

// // Fetch chat history for a session
// router.get("/:sessionId/history", auth, async (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const chats = await Chat.find({ sessionId }).sort({ createdAt: 1 });
//     res.json(chats);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;
import express from "express";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import Chat from "../models/Chat.js";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


// -------------------------------
// 1️⃣ START NEW SESSION (Guest or User)
// -------------------------------
router.post("/start", async (req, res) => {
  const sessionId = uuidv4();
  res.json({ sessionId });
});


// -------------------------------
// 2️⃣ ASSIGN GUEST SESSION TO LOGGED-IN USER
// -------------------------------
router.post("/assign-session", async (req, res) => {
  try {
    const { sessionId, userId } = req.body;

    if (!sessionId || !userId) {
      return res.status(400).json({ error: "Missing sessionId or userId" });
    }

    await Chat.updateMany(
      { sessionId, userId: null },
      { $set: { userId } }
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// -------------------------------
// 3️⃣ SEND MESSAGE (guest or logged user)
// -------------------------------
router.post("/:sessionId", async (req, res) => {
  try {
    const { message, userId } = req.body;  // optional
    const { sessionId } = req.params;

    if (!message) return res.status(400).json({ error: "Message required" });

    // Save user message
    await Chat.create({
      sessionId,
      userId: userId || null,
      role: "user",
      content: message
    });

    // AI response
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: message }]
    });

    const aiReply = response.choices[0].message.content;

    // Save AI reply
    await Chat.create({
      sessionId,
      userId: userId || null,
      role: "assistant",
      content: aiReply
    });

    res.json({ reply: aiReply });

  } catch (error) {
    res.status(500).json({ error: "AI Error", details: error.message });
  }
});


// -------------------------------
// 4️⃣ GET CHAT HISTORY
// -------------------------------
router.get("/:sessionId/history", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const chats = await Chat.find({ sessionId }).sort({ createdAt: 1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// -------------------------------
// 5️⃣ GET SAVED SESSIONS FOR LOGGED USER
// -------------------------------
router.get("/sessions/all/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const sessions = await Chat.aggregate([
      { $match: { userId } },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: "$sessionId",
          firstMessage: { $first: "$content" }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.json(sessions);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
