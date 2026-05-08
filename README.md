# THREE-EYED RAVEN - Web Security Checker 

> Advanced Web Reconnaissance & Security Intelligence Platform

THREE-EYED RAVEN is a full-stack web reconnaissance and OSINT platform built to analyze websites for security posture, infrastructure exposure, headers, DNS intelligence, SSL configuration, threat intelligence, and common security weaknesses.

The platform provides a cyberpunk-inspired interactive UI combined with real-time backend scanning using multiple APIs and network intelligence techniques.

---

# Features

## Recon & Intelligence

* DNS Record Enumeration

  * A
  * AAAA
  * MX
  * NS
  * TXT
  * CNAME

* WHOIS Lookup

* SSL Certificate Inspection

* HTTP Header Analysis

* robots.txt Detection

* Sitemap Discovery

* Redirect Chain Analysis

* Server Information Detection

* Open Port Scanning

* Sensitive Path Detection

---

## Security Analysis

* Security Header Validation

  * Content-Security-Policy
  * HSTS
  * X-Frame-Options
  * X-Content-Type-Options
  * Referrer-Policy
  * Permissions-Policy

* Vulnerability Severity Classification

  * High
  * Medium
  * Low

* Security Score Generation

* Threat Intelligence Checks

  * VirusTotal Reputation
  * Google Safe Browsing

* DNSSEC Detection

* Cookie Security Analysis

* CORS Analysis

---

## Smart Features

* Dynamic Security Scoring
* Contextual Vulnerability Descriptions
* Intelligent Fix Suggestions
* Real-time Scan Progress
* Dynamic Browser Title Updates During Scan
* Responsive Modern UI
* Cyberpunk / Futuristic Visual Design

---

# Tech Stack

## Frontend

* React
* Vite
* CSS3
* Axios
* Three.js-inspired animated background

## Backend

* Node.js
* Express.js
* Axios
* dotenv
* CORS

## External APIs

* VirusTotal API
* Google Safe Browsing API

---

# Project Structure

```text
Web-Security-Checker/
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── index.js
│   │
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── api/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── index.html
│   └── package.json
│
├── README.md
└── .gitignore
```

---

# Local Setup

## 1. Clone Repository

```bash
git clone https://github.com/adieladaniel/Web-Security-Checker.git
cd Web-Security-Checker
```

---

# Backend Setup

## 1. Navigate to Backend

```bash
cd backend
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Create Environment File

Create:

```text
backend/.env
```

Add:

```env
PORT=5000
VIRUSTOTAL_API_KEY=YOUR_API_KEY
GOOGLE_SAFE_BROWSING_API_KEY=YOUR_API_KEY
```

## 4. Start Backend

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

---

# Frontend Setup

## 1. Navigate to Frontend

```bash
cd frontend
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Create Environment File

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 4. Start Frontend

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# Deployment

## Backend Deployment (Render)

### Settings

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

### Environment Variables

```env
VIRUSTOTAL_API_KEY=YOUR_KEY
GOOGLE_SAFE_BROWSING_API_KEY=YOUR_KEY
NODE_ENV=production
```

---

## Frontend Deployment (Render Static Site)

### Settings

```text
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

### Environment Variables

```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
```

---

# Security Score Logic

The platform dynamically calculates a security score based on:

* Missing security headers
* Threat intelligence reputation
* DNSSEC status
* Sensitive path exposure
* Open ports
* SSL configuration
* CORS risk level
* Cookie security

Severity levels are weighted to produce an overall risk score.

---

# Current Capabilities

## Supported Checks

* DNS Enumeration
* WHOIS Analysis
* SSL Certificate Analysis
* Header Security Analysis
* robots.txt Parsing
* Sitemap Discovery
* Threat Intelligence Integration
* Open Port Detection
* Vulnerability Classification
* Automated Fix Suggestions

---

# Planned Improvements

* CVE Mapping
* Subdomain Enumeration
* WAF Detection
* Technology Fingerprinting
* Dark Web Intelligence
* Screenshot Capturing
* Historical DNS Tracking
* AI-powered Risk Explanation
* PDF Export Reports
* Multi-target Batch Scanning
* Authentication Detection
* Advanced Port Intelligence
* GeoIP Infrastructure Mapping

---

# Screenshots

## Landing Interface

Cyberpunk-inspired reconnaissance dashboard with animated network visualization.

## Vulnerability Intelligence

Real-time severity analysis with contextual explanations and remediation suggestions.

## Threat Intelligence

VirusTotal and Safe Browsing integration for reputation analysis.

---

# Disclaimer

This project is intended strictly for:

* Educational purposes
* Security learning
* Authorized reconnaissance
* Defensive analysis

Do NOT use this platform against systems you do not o
