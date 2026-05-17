import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { config } from './index.js'

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Smart Campus Complaint & Analytics API',
      version: '1.0.0',
      description: 'Production REST API for campus complaint submission, administration, analytics, and audit trails.',
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}`,
        description: 'Local API server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            requestId: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['src/modules/**/*.routes.js'],
})

export { swaggerUi }
