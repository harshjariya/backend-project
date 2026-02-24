const router = require("express").Router();
const { updateComment, deleteComment } = require("../controllers/commentController");
const { verifyToken } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Individual comment management
 */

/**
 * @swagger
 * /comments/{id}:
 *   patch:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 */
router.patch("/:id", verifyToken, updateComment);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       204:
 *         description: Deleted
 */
router.delete("/:id", verifyToken, deleteComment);

module.exports = router;
