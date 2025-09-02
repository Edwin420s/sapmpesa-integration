const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const router = express.Router();

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SAP M-Pesa Integration API',
    version: '1.0.0',
    description: 'Comprehensive API documentation for SAP M-Pesa Integration Microservices',
    contact: {
      name: 'API Support',
      email: 'support@company.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: process.env.API_BASE_URL || 'http://localhost:3000',
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Access token is missing or invalid',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              message: 'Authentication required'
            }
          }
        }
      },
      ValidationError: {
        description: 'Validation failed',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              message: 'Validation failed',
              errors: [
                {
                  field: 'email',
                  message: 'Invalid email format',
                  value: 'invalid-email'
                }
              ]
            }
          }
        }
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Error message description'
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string'
                },
                message: {
                  type: 'string'
                },
                value: {
                  type: 'string'
                }
              }
            }
          }
        }
      },
      Transaction: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          checkout_request_id: {
            type: 'string',
            example: 'ws_CO_01012023123456'
          },
          amount: {
            type: 'number',
            format: 'float',
            example: 1000.50
          },
          phone_number: {
            type: 'string',
            example: '254712345678'
          },
          status: {
            type: 'string',
            enum: ['PENDING', 'SUCCESS', 'FAILED'],
            example: 'SUCCESS'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      }
    }
  },
  security: [
    {
      BearerAuth: []
    }
  ]
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  apis: [
    './server/api-gateway/routes/*.js',
    './server/auth-service/routes/*.js',
    './server/mpesa-service/routes/*.js',
    './server/transaction-service/routes/*.js',
    './server/sap-service/routes/*.js',
    './server/notification-service/routes/*.js'
  ]
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

// Serve swagger docs
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SAP M-Pesa API Documentation'
}));

// Serve swagger spec as JSON
router.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

module.exports = router;