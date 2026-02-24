const swaggerJsdoc = require("swagger-jsdoc");

const opts = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Ticket Management System API",
            version: "1.0.0",
            description: "REST API for managing support tickets with RBAC"
        },
        servers: [
            {
                url: "http://localhost:" + (process.env.PORT || 3000),
                description: "Local dev"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },
    apis: ["./routes/*.js"]
};

module.exports = swaggerJsdoc(opts);
