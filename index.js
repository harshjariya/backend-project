require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const initDb = require("./config/initDb");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const commentRoutes = require("./routes/commentRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// swagger docs endpoint
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/tickets", ticketRoutes);
app.use("/comments", commentRoutes);

// basic health check
app.get("/", (req, res) => {
    res.json({ status: "running", message: "Ticket Management API", docs: "/docs" });
});

// 404
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
});

async function startServer() {
    try {
        await initDb();
        app.listen(PORT, () => {
            console.log(`Server is up on http://localhost:${PORT}`);
            console.log(`API docs: http://localhost:${PORT}/docs`);
        });
    } catch (err) {
        console.error("Failed to start:", err.message);
        process.exit(1);
    }
}

startServer();
