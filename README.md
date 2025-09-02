# SAP M-Pesa Integration Microservices Platform

A comprehensive microservices architecture for integrating SAP ERP with Safaricom M-Pesa Daraja API.

## Architecture

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

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd sap-mpesa-integration
