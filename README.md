# SAP M-Pesa Integration Microservices Platform

(https://img.shields.io/badge/version-1.0.0-blue.svg)
https://img.shields.io/badge/node-18.x-green.svg
https://img.shields.io/badge/license-MIT-yellow.svg
https://img.shields.io/badge/docker-ready-blue.svg

A comprehensive microservices architecture for integrating SAP ERP with Safaricom M-Pesa Daraja API. This platform provides seamless payment processing, transaction management, and real-time reconciliation between M-Pesa transactions and SAP financial systems.

# 🌟 Features

##Core Functionality
M-Pesa Integration: Full support for STK Push, B2C, C2B, and B2B transactions
SAP ERP Connectivity: Real-time synchronization with SAP accounting systems
Transaction Management: Complete lifecycle management from initiation to reconciliation
Real-time Notifications: Multi-channel alerts (Email, SMS, Push)
Comprehensive Reporting: Advanced analytics and reconciliation tools

##Technical Features
Microservices Architecture: Independently scalable services
API Gateway: Unified entry point with authentication and rate limiting
Real-time Updates: WebSocket support for live transaction tracking
Containerized Deployment: Docker and Kubernetes ready
Comprehensive Monitoring: Health checks, logging, and performance metrics

## Architecture

##System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Application                       │
│                   (React SPA - Port 3006)                   │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway                              │
│                   (Node.js - Port 3000)                     │
└─────────────────────────────────────────────────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│ Auth Service│         │M-Pesa Service│        │Transaction  │
│ (Port 3001) │         │ (Port 3002)  │        │Service      │
└─────────────┘         └─────────────┘         │(Port 3003)  │
       │                       │                └─────────────┘
       ▼                       ▼                       │
┌─────────────┐         ┌─────────────┐               ▼
│ MongoDB     │         │ PostgreSQL  │         ┌─────────────┐
│ (Port 27017)│         │ (Port 5432) │         │ SAP Service │
└─────────────┘         └─────────────┘         │(Port 3004)  │
                               │                └─────────────┘
                               ▼                       │
                       ┌─────────────┐               ▼
                       │Notification │         ┌─────────────┐
                       │Service      │         │ SAP System  │
                       │(Port 3005)  │         │ (External)  │
                       └─────────────┘         └─────────────┘
```
This project follows a microservices architecture with the following services:

1. **API Gateway** - Central entry point for all requests
2. **Auth Service** - User authentication and authorization
3. **M-Pesa Service** - M-Pesa Daraja API integration
4. **Transaction Service** - Transaction management and reporting
5. **SAP Service** - SAP ERP integration
6. **Notification Service** - Email, SMS, and push notifications

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL
- MongoDB
- Redis
- M-Pesa Daraja API credentials (Sandbox or Production)

## Quick Start

1. Clone the repository:
```
git clone https://github.com/Edwin420s/sapmpesa-integration.git
cd sap-mpesa-integration
```

Set up environment variables

# Copy environment examples
```
cp .env.example .env
cp client/.env.example client/.env
cp server/.env.example server/.env
# Configure your environment
nano .env  # Edit with your credentials
```

Start with Docker Compose

```
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f
```

Access the application

Frontend: http://localhost:3006
API Documentation: http://localhost:3000/docs
Health Dashboard: http://localhost:3000/health

Manual Development Setup

Install dependencies
```
# Root dependencies
npm install

# Client dependencies
cd client && npm install && cd ..

# Server dependencies
cd server && npm install && cd ..

# Individual service dependencies
cd server/api-gateway && npm install && cd ../..
cd server/auth-service && npm install && cd ../..
cd server/mpesa-service && npm install && cd ../..
cd server/transaction-service && npm install && cd ../..
cd server/sap-service && npm install && cd ../..
cd server/notification-service && npm install && cd ../..
```

Start databases
```
docker-compose up -d postgres mongodb redis
```
Run database migrations
```
docker-compose exec postgres psql -U postgres -d sap-mpesa -f /docker-entrypoint-initdb.d/001_create_mpesa_transactions.sql
docker-compose exec postgres psql -U postgres -d sap-mpesa -f /docker-entrypoint-initdb.d/002_create_audit_tables.sql
```
Start services
```
# Using concurrently (from root)
npm run dev

# Or individually:
# Terminal 1 - API Gateway
cd server/api-gateway && npm run dev

# Terminal 2 - Auth Service
cd server/auth-service && npm run dev

# Terminal 3 - M-Pesa Service
cd server/mpesa-service && npm run dev

# Terminal 4 - Transaction Service
cd server/transaction-service && npm run dev

# Terminal 5 - SAP Service
cd server/sap-service && npm run dev

# Terminal 6 - Notification Service
cd server/notification-service && npm run dev

# Terminal 7 - Client
cd client && npm start
```
📁 Project Structure

```
sap-mpesa-integration/
├── client/                 # React frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── services/      # API communication
│   │   ├── context/       # React context providers
│   │   ├── utils/         # Utility functions
│   │   ├── hooks/         # Custom React hooks
│   │   └── assets/        # Images and styles
│   ├── package.json
│   └── Dockerfile
├── server/                # Backend microservices
│   ├── api-gateway/       # API Gateway service
│   ├── auth-service/      # Authentication service
│   ├── mpesa-service/     # M-Pesa integration service
│   ├── transaction-service/ # Transaction management
│   ├── sap-service/       # SAP integration service
│   ├── notification-service/ # Notification service
│   ├── database/          # Database models and migrations
│   ├── shared/            # Shared utilities and middleware
│   └── config/            # Configuration files
├── nginx/                 # Reverse proxy configuration
├── docs/                  # Documentation
├── scripts/               # Deployment and utility scripts
├── docker-compose.yml     # Docker development setup
├── docker-compose.prod.yml # Docker production setup
└── README.md
```

🔧 Configuration
Environment Variables
Main .env file:
```
# Application
NODE_ENV=development
APP_VERSION=1.0.0

# Database
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=sap-mpesa

MONGODB_URI=mongodb://mongodb:27017/sap-mpesa
REDIS_URL=redis://redis:6379

# M-Pesa Configuration
MPESA_ENVIRONMENT=sandbox
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=your_passkey_here
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_CALLBACK_URL=http://localhost:3002/callback
MPESA_INITIATOR_NAME=your_initiator
MPESA_INITIATOR_PASSWORD=your_initiator_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# SAP Configuration
SAP_BASE_URL=https://your-sap-system.com
SAP_USERNAME=your_sap_username
SAP_PASSWORD=your_sap_password
SAP_CLIENT=100
SAP_LANGUAGE=EN
SAP_CASH_ACCOUNT=100100
SAP_REVENUE_ACCOUNT=400100

# Email/SMS Configuration
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number

# API Configuration
API_BASE_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3006
```

M-Pesa Setup
Sandbox Environment:

Register at Safaricom Developer Portal
Get sandbox credentials
Use test phone numbers: 254708374149, 254712345678

Production Environment:
Apply for production credentials
Setup IP whitelisting
Configure SSL certificates

SAP Integration
-SAP Connectivity:
-Configure SAP OData services
-Setup authentication (Basic Auth/OAuth)
-Map M-Pesa transactions to SAP document types

IDoc Configuration (Optional):
Configure IDoc types for transaction processing
Setup partner profiles
Configure port definitions

🎯 API Documentation
Authentication
Login:
```
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```
Response:
```
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "username": "admin",
    "name": "System Administrator",
    "role": "admin"
  }
}
```
M-Pesa Transactions
Initiate STK Push:
```
POST /mpesa/stk-push
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000,
  "phone": "254712345678",
  "account_reference": "INV001",
  "transaction_desc": "Payment for invoice"
}
```
Response:
```
{
  "success": true,
  "checkout_request_id": "ws_CO_01012023123456",
  "merchant_request_id": "12345-67890-1",
  "response_description": "Success. Request accepted for processing"
}
```
Transaction Management
Get Transactions:
```
GET /transactions?page=1&limit=20&status=SUCCESS
Authorization: Bearer <token>
```
Response: 
```
{
  "success": true,
  "transactions": [
    {
      "id": 1,
      "checkout_request_id": "ws_CO_01012023123456",
      "amount": 1000,
      "phone_number": "254712345678",
      "status": "SUCCESS",
      "mpesa_receipt": "RE1234567",
      "created_at": "2023-01-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```
SAP Integration
Sync with SAP:
```
POST /sap/sync-transaction
Authorization: Bearer <token>
Content-Type: application/json

{
  "transaction_id": 1,
  "sap_company_code": "1000",
  "sap_document_type": "SA",
  "sap_posting_date": "2023-01-01"
}
```
Complete API documentation available at: http://localhost:3000/docs

 Database Schema
PostgreSQL (Transactions)
mpesa_transactions:
```
CREATE TABLE mpesa_transactions (
    id SERIAL PRIMARY KEY,
    checkout_request_id VARCHAR(255) UNIQUE,
    merchant_request_id VARCHAR(255),
    amount DECIMAL(12,2) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    account_reference VARCHAR(100),
    transaction_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    mpesa_receipt VARCHAR(255) UNIQUE,
    sap_reference VARCHAR(255),
    sap_sync_status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
transaction_audit_log:
```
CREATE TABLE transaction_audit_log (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES mpesa_transactions(id),
    action VARCHAR(50) NOT NULL,
    description TEXT,
    performed_by VARCHAR(255),
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
MongoDB (Auth & Notifications)
users:
```
{
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'user', 'viewer'], default: 'user' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }
}
```
🔐 Security
Authentication & Authorization
JWT-based authentication
Role-based access control (Admin, User, Viewer)
Password hashing with bcrypt (12 rounds)
Token expiration and refresh mechanisms

API Security
Rate limiting (1000 requests/15 minutes per IP)
Input validation and sanitization
SQL injection prevention
XSS protection
CORS configuration
HTTPS enforcement in production

Data Protection
Environment variables for sensitive data
Database encryption at rest
Secure password storage
Audit logging for all operations

📊 Monitoring & Logging
Health Checks
```
# Check overall health
curl http://localhost:3000/health

# Detailed health information
curl http://localhost:3000/health/detailed

# Service-specific health
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # M-Pesa Service
```
Logging
Structured JSON logging in production
Console logging in development
Log rotation and retention
Error tracking and alerting

Performance Monitoring
Response time metrics
Error rate tracking
Database query performance
API endpoint statistics

🧪 Testing
Running Tests
```
# Run all tests
npm test

# Run specific service tests
cd server/auth-service && npm test
cd server/mpesa-service && npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.js
```
Test Coverage
Unit tests for all services
Integration tests for API endpoints
End-to-end testing setup
Mock services for external APIs

🚀 Deployment
Production Deployment
Environment Setup:
```
# Set production environment
export NODE_ENV=production

# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

Kubernetes Deployment:
```
# Apply Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmaps.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployments.yaml
kubectl apply -f k8s/services.yaml
kubectl apply -f k8s/ingress.yaml
```
Database Migration:
```
# Run production migrations
kubectl exec -it deployment/transaction-service -- \
  npx sequelize-cli db:migrate
```

CI/CD Pipeline
The project includes GitHub Actions for:

Automated testing on pull requests
Docker image building and pushing
Deployment to production environments
Security scanning and vulnerability checks

📈 Performance Optimization
Database Optimization

Indexing on frequently queried fields
Query optimization and caching
Connection pooling
Read replicas for high traffic

API Optimization
Response compression
Request caching
Pagination and filtering
Batch operations

Frontend Optimization
Code splitting and lazy loading
Asset compression
CDN integration
Service worker caching

🔧 Troubleshooting
Common Issues
Database Connection Issues:
```
# Check database status
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U postgres -c "\l"
```

M-Pesa API Errors:

Verify sandbox credentials
Check callback URL configuration
Validate phone number format

SAP Connection Issues:

Verify SAP system availability
Check authentication credentials
Validate network connectivity

CORS Errors:
```
# Check CORS configuration
curl -I -X OPTIONS http://localhost:3000
```
Debug Mode
Enable debug logging:
```
# Set debug environment variable
export DEBUG=*

# Or for specific services
export DEBUG=api-gateway,mpesa-service
```
🤝 Contributing
Development Workflow
Fork the repository

Create a feature branch:
```
git checkout -b feature/amazing-feature
```
Make your changes
Write tests for new functionality
Ensure all tests pass:
```
npm test
```
Commit your changes:
```
git commit -m 'Add amazing feature'
```
Push to the branch: 
```
git push origin feature/amazing-feature
```
Open a Pull Request

Code Standards

Follow ESLint configuration
Use Prettier for code formatting
Write comprehensive tests
Document new features
Update API documentation

📝 Changelog
v1.0.0 (Current)

Initial release with complete microservices architecture
M-Pesa STK Push, B2C, C2B integration
SAP ERP synchronization
Real-time notifications
Comprehensive reporting and analytics

🆘 Support
Documentation

API Documentation
Setup Guide
Deployment Guide
Troubleshooting Guide

Community Support

GitHub Issues: Report bugs
Discussions: Community forum
Wiki: Additional documentation

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments

Safaricom PLC for the M-Pesa Daraja API
SAP SE for ERP integration capabilities
Docker community for containerization tools
Open source contributors
