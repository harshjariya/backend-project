const express = require("express");
const router = express.Router();
const {
    createTicket,
    getTickets,
    assignTicket,
    changeTicketStatus,
    deleteTicket
} = require("../controllers/ticketController");
const { addComment, getComments } = require("../controllers/commentController");
const { verifyToken, authorizeRoles } = require("../middleware/auth");
const {
    validateTicketCreation,
    validateStatusChange,
    validateComment
} = require("../middleware/validate");

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Core ticket operations
 */

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Create a new ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *     responses:
 *       201:
 *         description: Ticket created
 */
router.post("/", verifyToken, authorizeRoles("USER", "MANAGER"), validateTicketCreation, createTicket);

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Get tickets (filtered by role)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of tickets
 */
router.get("/", verifyToken, getTickets);

/**
 * @swagger
 * /tickets/{id}:
 *   delete:
 *     summary: Delete a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted
 */
router.delete("/:id", verifyToken, authorizeRoles("MANAGER"), deleteTicket);

/**
 * @swagger
 * /tickets/{id}/assign:
 *   patch:
 *     summary: Assign ticket to staff
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - in: body
 *         name: assigned_to
 *         schema:
 *           type: object
 *           properties:
 *             assigned_to:
 *               type: integer
 *     responses:
 *       200:
 *         description: Assigned
 */
router.patch("/:id/assign", verifyToken, authorizeRoles("MANAGER", "SUPPORT"), assignTicket);

/**
 * @swagger
 * /tickets/{id}/status:
 *   patch:
 *     summary: Update ticket status
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch("/:id/status", verifyToken, authorizeRoles("MANAGER", "SUPPORT"), validateStatusChange, changeTicketStatus);

/**
 * @swagger
 * /tickets/{id}/comments:
 *   post:
 *     summary: Add a comment to a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 */
router.post("/:id/comments", verifyToken, validateComment, addComment);

/**
 * @swagger
 * /tickets/{id}/comments:
 *   get:
 *     summary: Get comments for a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get("/:id/comments", verifyToken, getComments);

module.exports = router;
