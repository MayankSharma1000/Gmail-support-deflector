# Gmail Support Deflector

An AI-powered customer support email assistant that helps support teams analyze incoming emails, detect customer sentiment, categorize issues, generate professional draft replies, and track email activity through a modern dashboard.

## Features

- Demo login authentication
- Modern dark SaaS-style dashboard
- AI-style email draft generation
- Sentiment analysis: Positive, Negative, Neutral
- Category detection: Refund, Billing, Technical, Urgent, Delivery, General Support
- Tone selector for reply generation
- Email history saved in browser localStorage
- Analytics dashboard for total emails, drafts, positive emails, and urgent issues
- Copy generated reply to clipboard
- RAG Knowledge Base placeholder for future expansion
- Gmail integration placeholder for future OAuth/Gmail API connection

## Screenshots

### Login Page
![Login Page](./assets/login-page.png)

### Dashboard
![Dashboard](./assets/dashboard.png)

### Analytics and Working
![Analytics and Working](./assets/analytics-working.png)

### History
![History](./assets/history.png)

### Features
![Features](./assets/features.png)

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript
- localStorage

### Backend
- Node.js
- Express.js
- CORS
- dotenv

### AI / Logic
- Rule-based sentiment analysis
- Rule-based category detection
- Tone-based draft generation
- OpenRouter API prepared through environment variables

## Project Structure

```text
gmail-support-deflector/
│
├── assets/
│   ├── login-page.png
│   ├── dashboard.png
│   ├── analytics-working.png
│   ├── history.png
│   └── features.png
│
├── client/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── server/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env
│
├── .gitignore
└── README.md