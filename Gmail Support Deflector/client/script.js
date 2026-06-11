/* =====================================================
   GMAIL SUPPORT DEFLECTOR - FRONTEND SCRIPT

   This file handles:
   1. Demo login authentication
   2. Dashboard show/hide
   3. Dark and light mode
   4. Sending email data to backend
   5. Showing AI draft output
   6. Showing sentiment and category
   7. Copying generated reply
   8. Saving email history in browser localStorage
   9. Updating analytics cards
===================================================== */


/* =====================================================
   DOM ELEMENT SELECTION
   We collect all HTML elements that JavaScript needs.
===================================================== */

// Login elements
const loginPage = document.getElementById("loginPage");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const demoLoginBtn = document.getElementById("demoLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");

// Email input elements
const customerEmail = document.getElementById("customerEmail");
const previousReplies = document.getElementById("previousReplies");
const toneSelector = document.getElementById("toneSelector");
const generateBtn = document.getElementById("generateBtn");

// Output elements
const output = document.getElementById("output");
const sentimentResult = document.getElementById("sentimentResult");
const categoryResult = document.getElementById("categoryResult");
const copyBtn = document.getElementById("copyBtn");
const saveHistoryBtn = document.getElementById("saveHistoryBtn");

// History and analytics elements
const historyList = document.getElementById("historyList");
const totalEmails = document.getElementById("totalEmails");
const draftsGenerated = document.getElementById("draftsGenerated");
const positiveEmails = document.getElementById("positiveEmails");
const urgentEmails = document.getElementById("urgentEmails");


/* =====================================================
   LOCAL STORAGE KEYS
   These names are used to save data inside browser.
===================================================== */

const AUTH_KEY = "supportDeflectorAuth";
const HISTORY_KEY = "supportDeflectorHistory";


/* =====================================================
   APP STATE
   These variables store current session data.
===================================================== */

let latestDraftData = null;


/* =====================================================
   INITIAL APP LOAD
   Runs automatically when page opens.
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  loadAuthState();
  renderHistory();
  updateAnalytics();
});


/* =====================================================
   LOGIN AUTHENTICATION

   This is demo authentication for portfolio version.
   Real-world authentication can later be replaced with:
   - JWT
   - Express sessions
   - Google OAuth
   - Firebase Auth
===================================================== */

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  loginUser(email);
});


demoLoginBtn.addEventListener("click", () => {
  loginUser("demo@supportdeflector.com");
});


function loginUser(email) {
  const user = {
    email,
    loggedInAt: new Date().toISOString(),
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(user));

  showDashboard();
}


function logoutUser() {
  localStorage.removeItem(AUTH_KEY);

  loginPage.classList.remove("hidden");
  dashboard.classList.add("hidden");

  loginForm.reset();
}


function loadAuthState() {
  const savedUser = localStorage.getItem(AUTH_KEY);

  if (savedUser) {
    showDashboard();
  } else {
    loginPage.classList.remove("hidden");
    dashboard.classList.add("hidden");
  }
}


function showDashboard() {
  loginPage.classList.add("hidden");
  dashboard.classList.remove("hidden");
}

logoutBtn.addEventListener("click", logoutUser);

/* =====================================================
   GENERATE AI DRAFT

   This function sends customer email, previous replies,
   and selected tone to the backend.

   Backend route used:
   POST http://localhost:5001/generate-draft
===================================================== */

generateBtn.addEventListener("click", async () => {
  const emailText = customerEmail.value.trim();
  const previousReplyText = previousReplies.value.trim();
  const selectedTone = toneSelector.value;

  if (!emailText || !previousReplyText) {
    alert("Please fill customer email and previous replies.");
    return;
  }

  setLoadingState(true);

  try {
    const response = await fetch("http://localhost:5001/generate-draft", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerEmail: emailText,
        previousReplies: previousReplyText,
        tone: selectedTone,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong on backend.");
    }

    latestDraftData = {
      customerEmail: emailText,
      previousReplies: previousReplyText,
      tone: selectedTone,
      draft: data.draft,
      sentiment: data.sentiment,
      category: data.category,
      createdAt: new Date().toISOString(),
    };

    output.value = data.draft || "No draft received.";
    sentimentResult.textContent = data.sentiment || "-";
    categoryResult.textContent = data.category || "-";

    incrementDraftCount();

  } catch (error) {
    console.error("Frontend error:", error);

    output.value =
      "Frontend could not connect to backend. Please check if server is running on port 5001.";

    sentimentResult.textContent = "-";
    categoryResult.textContent = "-";
  } finally {
    setLoadingState(false);
  }
});


function setLoadingState(isLoading) {
  generateBtn.disabled = isLoading;

  generateBtn.textContent = isLoading
    ? "Generating..."
    : "Generate AI Draft";

  if (isLoading) {
    output.value = "Generating draft...";
    sentimentResult.textContent = "Analyzing...";
    categoryResult.textContent = "Detecting...";
  }
}


/* =====================================================
   COPY GENERATED REPLY

   Copies the draft reply to clipboard.
===================================================== */

copyBtn.addEventListener("click", async () => {
  const draftText = output.value.trim();

  if (!draftText) {
    alert("No reply to copy.");
    return;
  }

  try {
    await navigator.clipboard.writeText(draftText);
    alert("Reply copied to clipboard.");
  } catch (error) {
    console.error("Copy failed:", error);
    alert("Could not copy reply.");
  }
});


/* =====================================================
   SAVE EMAIL HISTORY

   Stores generated email data in browser localStorage.
   This makes the History section work even after refresh.
===================================================== */

saveHistoryBtn.addEventListener("click", () => {
  if (!latestDraftData) {
    alert("Generate a draft first before saving history.");
    return;
  }

  const history = getHistory();

  history.unshift(latestDraftData);

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

  renderHistory();
  updateAnalytics();

  alert("Email saved to history.");
});


function getHistory() {
  const savedHistory = localStorage.getItem(HISTORY_KEY);

  return savedHistory ? JSON.parse(savedHistory) : [];
}


function renderHistory() {
  const history = getHistory();

  historyList.innerHTML = "";

  if (history.length === 0) {
    historyList.innerHTML =
      '<p class="empty-history">No email history yet.</p>';
    return;
  }

  history.forEach((item) => {
    const historyItem = document.createElement("div");
    historyItem.classList.add("history-item");

    historyItem.innerHTML = `
      <h3>${item.category || "General Support"}</h3>

      <p>
        ${shortenText(item.customerEmail, 160)}
      </p>

      <div class="history-meta">
        <span>Sentiment: ${item.sentiment || "-"}</span>
        <span>Tone: ${item.tone || "-"}</span>
        <span>${formatDate(item.createdAt)}</span>
      </div>
    `;

    historyList.appendChild(historyItem);
  });
}


/* =====================================================
   ANALYTICS DASHBOARD

   Updates total emails, positive emails, urgent emails,
   and generated draft count.
===================================================== */

function updateAnalytics() {
  const history = getHistory();

  totalEmails.textContent = history.length;

  positiveEmails.textContent = history.filter((item) => {
    return item.sentiment === "Positive";
  }).length;

  urgentEmails.textContent = history.filter((item) => {
    return item.category === "Urgent Issue";
  }).length;

  const savedDraftCount = localStorage.getItem("draftCount") || "0";
  draftsGenerated.textContent = savedDraftCount;
}


function incrementDraftCount() {
  const currentCount = Number(localStorage.getItem("draftCount") || "0");
  const newCount = currentCount + 1;

  localStorage.setItem("draftCount", String(newCount));

  draftsGenerated.textContent = newCount;
}


/* =====================================================
   HELPER FUNCTIONS

   These small reusable functions keep code clean.
===================================================== */

function shortenText(text, maxLength) {
  if (!text) return "";

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength) + "...";
}


function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}