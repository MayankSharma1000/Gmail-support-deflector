/* =====================================================
   GMAIL SUPPORT DEFLECTOR - BACKEND SERVER

   This backend handles:
   1. Express server setup
   2. CORS setup for frontend-backend connection
   3. JSON request parsing
   4. Email sentiment analysis
   5. Email category detection
   6. Tone-based AI draft generation
   7. Placeholder Gmail integration route
   8. Placeholder RAG knowledge base route

   NOTE:
   This version uses rule-based/mock AI logic.
   Later, you can replace generateAIDraft() with:
   - OpenAI API
   - Gemini API
   - OpenRouter API
   - Local LLM
===================================================== */


/* =====================================================
   IMPORTS
===================================================== */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";


/* =====================================================
   ENVIRONMENT SETUP
   Loads variables from .env file.
===================================================== */

dotenv.config();


/* =====================================================
   APP SETUP
===================================================== */

const app = express();
const PORT = process.env.PORT || 5001;


/* =====================================================
   MIDDLEWARES

   cors() allows frontend running separately to call backend.
   express.json() allows backend to read JSON request body.
===================================================== */

app.use(cors());
app.use(express.json());


/* =====================================================
   HEALTH CHECK ROUTE

   Open http://localhost:5001 in browser.
   If this text appears, backend is working.
===================================================== */

app.get("/", (req, res) => {
  res.send("Gmail Support Deflector backend is running successfully.");
});


/* =====================================================
   SENTIMENT ANALYSIS FUNCTION

   This detects the mood of customer email.
   It is rule-based for now.

   Output:
   - Positive
   - Negative
   - Neutral
===================================================== */

function analyzeSentiment(customerEmail) {
  const email = customerEmail.toLowerCase();

  const negativeWords = [
    "angry",
    "terrible",
    "worst",
    "not working",
    "broken",
    "delay",
    "late",
    "problem",
    "disappointed",
    "frustrated",
    "complaint",
    "cancel",
    "urgent",
    "unhappy",
    "poor service",
  ];

  const positiveWords = [
    "thanks",
    "thank you",
    "great",
    "good",
    "helpful",
    "resolved",
    "appreciate",
    "amazing",
    "excellent",
    "happy",
    "quickly",
    "professional",
  ];

  let negativeScore = 0;
  let positiveScore = 0;

  negativeWords.forEach((word) => {
    if (email.includes(word)) {
      negativeScore++;
    }
  });

  positiveWords.forEach((word) => {
    if (email.includes(word)) {
      positiveScore++;
    }
  });

  if (positiveScore > negativeScore) {
    return "Positive";
  }

  if (negativeScore > positiveScore) {
    return "Negative";
  }

  return "Neutral";
}

/* =====================================================
   CATEGORY DETECTION FUNCTION

   This detects what type of support email it is.

   Output examples:
   - Refund Request
   - Technical Issue
   - Billing Issue
   - Urgent Issue
   - General Support
===================================================== */

function detectCategory(customerEmail) {
  const email = customerEmail.toLowerCase();

  if (
    email.includes("urgent") ||
    email.includes("immediately") ||
    email.includes("as soon as possible") ||
    email.includes("asap")
  ) {
    return "Urgent Issue";
  }

  if (
    email.includes("refund") ||
    email.includes("return") ||
    email.includes("money back") ||
    email.includes("cancel")
  ) {
    return "Refund Request";
  }

  if (
    email.includes("payment") ||
    email.includes("billing") ||
    email.includes("invoice") ||
    email.includes("charged") ||
    email.includes("transaction")
  ) {
    return "Billing Issue";
  }

  if (
    email.includes("login") ||
    email.includes("error") ||
    email.includes("bug") ||
    email.includes("not working") ||
    email.includes("crash") ||
    email.includes("unable")
  ) {
    return "Technical Issue";
  }

  if (
    email.includes("delivery") ||
    email.includes("shipping") ||
    email.includes("order") ||
    email.includes("tracking")
  ) {
    return "Order / Delivery Issue";
  }

  return "General Support";
}


/* =====================================================
   AI DRAFT GENERATOR FUNCTION

   This generates response drafts based on:
   1. Customer email
   2. Previous replies / brand tone
   3. Sentiment
   4. Category
   5. Selected tone

   This is currently mock/rule-based.
   Later, replace this with real AI API call.
===================================================== */

function generateAIDraft({
  customerEmail,
  previousReplies,
  sentiment,
  category,
  tone,
}) {
  const greeting = getGreetingByTone(tone);
  const opening = getOpeningBySentiment(sentiment, tone);
  const categoryResponse = getCategoryResponse(category);
  const toneClosing = getClosingByTone(tone);

  return `${greeting}

${opening}

${categoryResponse}

I have reviewed the concern shared in your email and will make sure it is handled carefully. Based on the details provided, the next step would be to verify the issue and update you with the correct resolution.

${toneClosing}

Regards,
Mayank`;
}


/* =====================================================
   TONE HELPER FUNCTIONS

   These functions keep generateAIDraft clean and readable.
===================================================== */

function getGreetingByTone(tone) {
  switch (tone) {
    case "friendly":
      return "Hi there,";

    case "empathetic":
      return "Hi,";

    case "apologetic":
      return "Dear Customer,";

    case "short":
      return "Hi,";

    default:
      return "Hello,";
  }
}


function getOpeningBySentiment(sentiment, tone) {
  if (tone === "apologetic") {
    return "I sincerely apologize for the inconvenience caused.";
  }

  if (sentiment === "Negative") {
    return "I understand your concern, and I’m sorry that you had to face this issue.";
  }

  if (sentiment === "Positive") {
    return "Thank you for reaching out and sharing the details with us.";
  }

  return "Thank you for contacting support.";
}


function getCategoryResponse(category) {
  switch (category) {
    case "Refund Request":
      return "Regarding your refund request, I will check the payment and order details before confirming the next steps.";

    case "Technical Issue":
      return "For the technical issue, I will review the error details and help you with the appropriate troubleshooting steps.";

    case "Billing Issue":
      return "For the billing concern, I will verify the transaction and invoice details from our side.";

    case "Urgent Issue":
      return "Since this appears to be urgent, I will prioritize this request and work on it as quickly as possible.";

    case "Order / Delivery Issue":
      return "For the order or delivery concern, I will check the tracking and order status before updating you.";

    default:
      return "I will review the details and assist you with the best possible solution.";
  }
}


function getClosingByTone(tone) {
  switch (tone) {
    case "friendly":
      return "I’ll keep you updated and make sure this gets sorted soon.";

    case "empathetic":
      return "I understand how this can be frustrating, and I’ll do my best to help you resolve it.";

    case "apologetic":
      return "Once again, I apologize for the inconvenience and appreciate your patience.";

    case "short":
      return "I’ll check this and update you shortly.";

    default:
      return "I’ll check this from my side and update you shortly with the next steps.";
  }
}


/* =====================================================
   GENERATE DRAFT API ROUTE

   Frontend sends:
   - customerEmail
   - previousReplies
   - tone

   Backend returns:
   - draft
   - sentiment
   - category
   - modelUsed
===================================================== */

app.post("/generate-draft", async (req, res) => {
  try {
    const { customerEmail, previousReplies, tone } = req.body;

    if (!customerEmail || !previousReplies) {
      return res.status(400).json({
        error: "Customer email and previous replies are required.",
      });
    }

    const sentiment = analyzeSentiment(customerEmail);
    const category = detectCategory(customerEmail);

    const draft = generateAIDraft({
      customerEmail,
      previousReplies,
      sentiment,
      category,
      tone: tone || "professional",
    });

    res.json({
      draft,
      sentiment,
      category,
      modelUsed: "rule-based-mock-ai-v2",
    });
  } catch (error) {
    console.log("===== SERVER ERROR =====");
    console.log(error);

    res.status(500).json({
      error: error.message || "Unknown server error.",
    });
  }
});


/* =====================================================
   GMAIL INTEGRATION PLACEHOLDER ROUTE

   This route shows that Gmail integration is planned.
   Later, you can connect:
   - Google OAuth
   - Gmail API
   - Fetch inbox messages
   - Fetch sent replies
===================================================== */

app.get("/gmail/status", (req, res) => {
  res.json({
    connected: false,
    message:
      "Gmail integration placeholder. Add Google OAuth and Gmail API in the next version.",
  });
});


/* =====================================================
   RAG KNOWLEDGE BASE PLACEHOLDER ROUTE

   RAG = Retrieval Augmented Generation

   Later, this can store:
   - FAQs
   - refund policies
   - product information
   - company rules
===================================================== */

app.get("/knowledge-base", (req, res) => {
  res.json({
    status: "placeholder",
    documents: [],
    message:
      "Knowledge base placeholder. Add FAQ upload, embeddings, and vector search in advanced version.",
  });
});


/* =====================================================
   SERVER START
===================================================== */

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});