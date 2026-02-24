const express = require("express");
const router = express.Router();
const { login, logout } = require("../controllers/authController");
const { validateLogin } = require("../middleware/validate");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and session management
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in to the system
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", validateLogin, login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out and clear session
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post("/logout", logout);

module.exports = router;
