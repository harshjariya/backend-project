const router = require("express").Router();
const { createUser, getAllUsers } = require("../controllers/userController");
const { verifyToken, authorizeRoles } = require("../middleware/auth");
const { validateUserCreation } = require("../middleware/validate");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (Manager only)
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [MANAGER, SUPPORT, USER]
 *     responses:
 *       201:
 *         description: User created
 *       403:
 *         description: Forbidden
 */
router.post("/", verifyToken, authorizeRoles("MANAGER"), validateUserCreation, createUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/", verifyToken, authorizeRoles("MANAGER"), getAllUsers);

module.exports = router;
