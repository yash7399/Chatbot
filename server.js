// WaterWise Chatbot using Node.js and Google Generative AI

const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config()

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.7, // Adjusted for more balanced responses
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    // Additional safety categories can be added as needed
  ];

  // Pre-defined conversation history tailored for WaterWise
  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [{ text: "" }],
      },
      {
        role: "model",
        parts: [{ text: "Hi there! Welcome to WaterWise, your platform for exploring water-saving techniques. How can I assist you today?" }],
      },
      {
        role: "user",
        parts: [{ text: "Tell me about irrigation efficiency." }],
      },
      {
        role: "model",
        parts: [{ text: "Irrigation efficiency involves using water more effectively in agriculture. Techniques like drip irrigation can reduce water waste by delivering water directly to plant roots. Would you like to know more about specific methods?" }],
      },
      {
        role: "user",
        parts: [{ text: "What about water reuse?" }],
      },
      {
        role: "model",
        parts: [{ text: "Water reuse refers to recycling water for multiple purposes. Greywater, for example, can be reused for irrigation in both urban and agricultural settings. Would you like to know about domestic conservation techniques?" }],
      },
    ],
  });

  const result = await chat.sendMessage(userInput);
  const response = result.response;
  return response.text();
}

// Serve index.html for front-end
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Serve loader.gif (if needed for UI)
app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});

// Chat endpoint for handling user input
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('Incoming /chat request', userInput);
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
