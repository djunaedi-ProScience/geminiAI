//import
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

//initialize express
dotenv.config();
const app = express();
app.use(express.json());
const upload = multer({ dest: "uploads/" });
// Initialize Gemini AI
const GEMINI_API_KEY = process.env.ENV_GEMINI_API_KEY; // Replace with your API Key
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
app.get("/", (req, res) => {
  res.send("Server is running. Use the /validate endpoints.");
});
// Function to call Gemini AI for text analysis
async function analyzeWithGemini(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error calling Gemini API", error);
    return null;
  }
}

//generate text hack8
app.post("/generate/text", async (req, res) => {
  const { prompt } = req.body;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  res.json({ text: response.text() });
});

// /generate-from-image
app.post("/generate-from-image", upload.single("image"), async (req, res) => {
  const { image } = req.file;
  const { prompt } = req.body;
  const result = await model.generateContentFromImage({
    image,
    prompt,
  });
  const response = await result.response;
  res.json({ text: response.text() });
});

// /generate-from-document
app.post(
  "/generate-from-document",
  upload.single("document"),
  async (req, res) => {
    const { document } = req.file;
    const { prompt } = req.body;
    const result = await model.generateContentFromDocument({
      document,
      prompt,
    });
    const response = await result.response;
    res.json({ text: response.text() });
  }
);

// /generate-from-audio
app.post("/generate-from-audio", upload.single("audio"), async (req, res) => {
  const { audio } = req.file;
  const { prompt } = req.body;
  const result = await model.generateContentFromAudio({
    audio,
    prompt,
  });
  const response = await result.response;
  res.json({ text: response.text() });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
