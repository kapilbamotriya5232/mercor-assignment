import { Options } from 'swagger-jsdoc';

export const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'mercor API',
      version: '1.0.0',
      description: 'Time tracking system compatible with Insightful\'s API',
    },
    servers: [
      { 
        url: 'http://localhost:3000', 
        description: 'Development' 
      },
      { 
        url: 'https://mercor-assignment-olive.vercel.app/', 
        description: 'Production' 
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
    },
  },
  apis: ['./app/api/**/*.ts', './app/api/auth/**/*.ts'], // Path to API routes including auth
};
