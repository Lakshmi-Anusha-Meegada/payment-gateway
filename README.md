## Payment Gateway System
## Overview

● This project is a mini payment gateway inspired by popular fintech platforms such as Razorpay and Stripe.

● It enables merchants to securely create payment orders through authenticated APIs, while customers complete payments via a hosted checkout page.

● The system demonstrates real-world fintech concepts including API authentication, payment validation logic, transaction lifecycle management, and frontend–backend integration.

## Tech Stack

● Backend: Node.js, Express.js

● Database: PostgreSQL

● Frontend: HTML, CSS, JavaScript

● Containerization: Docker & Docker Compose

● API Testing: Postman

## Core Features

● Merchant authentication using API Key & API Secret

● Automatic test merchant seeding on application startup

● Order creation and retrieval APIs

● Payment processing using UPI and Card methods

● UPI VPA format validation

● Card validation using Luhn Algorithm

● Card network detection (Visa, Mastercard, Amex, RuPay)

● Payment lifecycle management
(processing → success / failed)

● Hosted checkout page for customers

● Public APIs for checkout flow (no authentication required)

## Test Merchant Credentials (Auto-Seeded)

● These credentials are automatically inserted when the server starts.

‣ Email: test@example.com

‣ API Key: key_test_abc123

‣ API Secret: secret_test_xyz789

## Project Structure
payment-gateway/

├── backend/

│   ├── src/

│   │   ├── routes/

│   │   ├── middleware/

│   │   ├── utils/

│   │   ├── db.js

│   │   ├── seed.js

│   │   └── index.js

│   ├── Dockerfile

│   └── package.json

├── checkout-page/

│   └── index.html

├── docker-compose.yml

├── .env.example

└── README.md


‣ How to Run the Project
1. Clone the repository
git clone <repository-url>
cd payment-gateway

2. Create .env file
DATABASE_URL=postgresql://gateway_user:gateway_pass@postgres:5432/payment_gateway
PORT=8000

3. Start all services using Docker
● docker compose up -d

4. Verify backend health

● Open in browser:

http://localhost:8000/health

## Using the Application
## Create an Order (Merchant API)
POST /api/v1/orders
Headers:
X-Api-Key: key_test_abc123
X-Api-Secret: secret_test_xyz789

## Hosted Checkout Page

● After creating an order, open:

    checkout-page/index.html?order_id=ORDER_ID

● Customers can complete payments via UPI or Card.

## API Endpoints
## Health Check

● GET /health

## Orders (Authenticated)

● POST /api/v1/orders

● GET /api/v1/orders/:order_id

## Payments (Authenticated)

● POST /api/v1/payments

● GET /api/v1/payments/:payment_id

## Public Checkout APIs

● GET /api/v1/orders/:order_id/public

● GET /api/v1/payments/:payment_id

## Payment Flow

● Merchant creates an order via API

● Customer is redirected to hosted checkout page

● Customer selects payment method (UPI or Card)

● Payment is processed with simulated bank delay

● Payment status updates to success or failed

## Learning Outcomes

● Implemented real-world API authentication

● Built a secure payment processing system

● Applied validation algorithms (Luhn, VPA)

● Managed transaction state machines

● Integrated backend APIs with frontend checkout UI

● Gained hands-on fintech and e-commerce experience


## Final Note

● This project demonstrates end-to-end payment gateway development and reflects practical fintech system design principles.
