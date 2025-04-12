// config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Swagger options
// config/swagger.js
const options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Service Marketplace API',
          version: '1.0.0',
          description: 'API documentation for the Service Marketplace application',
        },
        servers: [
          {
            url: 'http://localhost:5000',
            description: 'Local server',
          },
        ],
        components: {
          schemas: {
            Category: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  example: 'Electrician',
                },
                description: {
                  type: 'string',
                  example: 'Professional electrical services',
                },
                icon: {
                  type: 'string',
                  example: 'zap',
                },
              },
            },
          },
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
      apis: ['./src/routes/*.js'],
    };

// Generate Swagger specs
const specs = swaggerJsdoc(options);

// Swagger middleware
export const swaggerDocs = (app) => {
  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

  // Serve Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log(`📚 Swagger docs available at http://localhost:5000/api-docs`);
};