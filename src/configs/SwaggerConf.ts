import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Byte Sized Health API',
      version: '1.0.0',
      description: 'API documentation for Byte Sized Health - Burnout Detection & Health Monitoring System',
      contact: {
        name: 'API Support',
        email: 'support@bytesizedhealth.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
      {
        url: 'https://api.bytesizedhealth.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            name: {
              type: 'string',
            },
            phone: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        DailyCheckIn: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            date: {
              type: 'string',
              format: 'date',
            },
            sleepHours: {
              type: 'number',
              minimum: 0,
              maximum: 24,
            },
            workHours: {
              type: 'number',
              minimum: 0,
              maximum: 24,
            },
            moodLevel: {
              type: 'integer',
              minimum: 1,
              maximum: 10,
            },
            stressLevel: {
              type: 'integer',
              minimum: 1,
              maximum: 10,
            },
            activityMinutes: {
              type: 'integer',
              minimum: 0,
            },
            notes: {
              type: 'string',
              nullable: true,
            },
            estimatedBurnoutScore: {
              type: 'number',
              nullable: true,
            },
            estimatedRiskLevel: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH'],
              nullable: true,
            },
            aiBurnoutScore: {
              type: 'number',
              nullable: true,
            },
            aiRiskLevel: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH'],
              nullable: true,
            },
            aiAnalysis: {
              type: 'string',
              nullable: true,
            },
            aiRecommendations: {
              type: 'string',
              nullable: true,
            },
            aiProcessedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Article: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            title: {
              type: 'string',
            },
            slug: {
              type: 'string',
            },
            description: {
              type: 'string',
              nullable: true,
            },
            content: {
              type: 'string',
            },
            thumbnail: {
              type: 'string',
              nullable: true,
            },
            sources: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                  },
                  url: {
                    type: 'string',
                  },
                },
              },
            },
            status: {
              type: 'string',
              enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
            },
            publishedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            viewCount: {
              type: 'integer',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Check-ins',
        description: 'Daily health check-in endpoints',
      },
      {
        name: 'AI',
        description: 'AI-powered analysis endpoints',
      },
      {
        name: 'Articles',
        description: 'Health education articles endpoints',
      },
    ],
  },
  apis: ['./src/routes/**/*.ts', './src/controllers/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
