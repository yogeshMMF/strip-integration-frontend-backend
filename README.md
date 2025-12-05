# Angular 20 Stripe Payment Integration

This project demonstrates how to integrate Stripe payment gateway in Angular 20 using Payment Intents.

## Prerequisites

- Node.js (v18 or higher)
- Angular CLI (v20)
- Stripe Account with API keys

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Stripe Keys

Update the following files with your Stripe keys:

**Frontend (Angular):**

- File: `src/environments/environment.ts`
- Add your Stripe **Publishable Key**

**Backend (Node.js/Express):**

- File: `server/server.js`
- Add your Stripe **Secret Key**

### 3. Run the Application

**Start Backend Server:**

```bash
cd server
npm install
node server.js
```

**Start Angular App:**

```bash
ng serve
```

Navigate to `http://localhost:4200`

## Project Structure

```
stripe-angular-app/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── payment/
│   │   │       ├── payment.component.ts
│   │   │       ├── payment.component.html
│   │   │       └── payment.component.css
│   │   ├── services/
│   │   │   └── payment.service.ts
│   │   └── app.component.ts
│   └── environments/
│       ├── environment.ts
│       └── environment.prod.ts
├── server/
│   ├── server.js
│   └── package.json
└── package.json
```

## Features

- Create Payment Intent
- Stripe Elements Integration
- Card Payment Processing
- Payment Confirmation
- Error Handling
- Responsive Design

## Stripe Keys Required

1. **Publishable Key** (pk*test*... or pk*live*...)
2. **Secret Key** (sk*test*... or sk*live*...)

## Security Notes

- Never expose your Secret Key in frontend code
- Always use HTTPS in production
- Validate payments on the server side
- Store sensitive keys in environment variables
