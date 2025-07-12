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

// Validate financial institution
app.post("/validate/institution", async (req, res) => {
  const { institution } = req.body;
  const response = await analyzeWithGemini(
    `Is '${institution}' a valid financial institution? Reply 'true' or 'false'.`
  );
  res.json({
    found: !!response,
    institution_name: institution,
    valid: response?.toLowerCase().includes("true"),
  });
});
// Validate name in document
app.post("/validate/name", async (req, res) => {
  const { name } = req.body;
  const response = await analyzeWithGemini(
    `Check if the name '${name}' exists in the document. Reply 'true' or 'false'.`
  );
  res.json({
    found: !!response,
    valid: response?.toLowerCase().includes("true"),
  });
});
// Validate amount in document
app.post("/validate/amount", async (req, res) => {
  const { amount } = req.body;
  const response = await analyzeWithGemini(
    `Check if the amount '${amount}' exists in the document. Reply 'true' or 'false'.`
  );
  res.json({
    found: !!response,
    valid: response?.toLowerCase().includes("true"),
  });
});
// Validate date within a specific range
app.post("/validate/date", async (req, res) => {
  const { days } = req.body;
  const response = await analyzeWithGemini(
    `Check if the document contains a date within the last '${days}' days. Reply 'true' or 'false'.`
  );
  res.json({
    found: !!response,
    valid: response?.toLowerCase().includes("true"),
  });
});
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
