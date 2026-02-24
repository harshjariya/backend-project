const pool = require("../config/db");
const asyncHandler = require("../middleware/asyncHandler");

 
function checkTicketAccess(ticket, user) {
    if (user.role === "MANAGER") return true;
    if (user.role === "SUPPORT" && ticket.assigned_to === user.id) return true;
    if (user.role === "USER" && ticket.created_by === user.id) return true;
    return false;
}

const addComment = asyncHandler(async (req, res) => {
    const { id: ticketId } = req.params;
    const { content } = req.body;
    const { id: userId, role } = req.user;

    const [ticketRows] = await pool.query("SELECT * FROM tickets WHERE id = ?", [ticketId]);
    if (!ticketRows.length) {
        return res.status(404).json({ message: "Unable to find ticket" });
    }

    const ticket = ticketRows[0];
    if (!checkTicketAccess(ticket, req.user)) {
        return res.status(403).json({ message: "Access denied: You are not authorized for this ticket" });
    }

    const [saveResult] = await pool.query(
        "INSERT INTO ticket_comments (ticket_id, user_id, content) VALUES (?, ?, ?)",
        [ticketId, userId, content.trim()]
    );

    res.status(201).json({
        success: true,
        data: {
            id: saveResult.insertId,
            ticketId: parseInt(ticketId),
            userId,
            content: content.trim()
        }
    });
});

const getComments = asyncHandler(async (req, res) => {
    const { id: ticketId } = req.params;

    const [ticketRows] = await pool.query("SELECT * FROM tickets WHERE id = ?", [ticketId]);
    if (!ticketRows.length) {
        return res.status(404).json({ message: "Ticket not found" });
    }

    if (!checkTicketAccess(ticketRows[0], req.user)) {
        return res.status(403).json({ message: "Access denied" });
    }

    const [commentData] = await pool.query(
        `SELECT c.*, u.username as author
         FROM ticket_comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.ticket_id = ?
         ORDER BY c.created_at ASC`,
        [ticketId]
    );

    res.status(200).json({ success: true, data: commentData });
});

const updateComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
        return res.status(400).json({ message: "Comment body is required" });
    }

    const [existing] = await pool.query("SELECT * FROM ticket_comments WHERE id = ?", [id]);
    if (!existing.length) {
        return res.status(404).json({ message: "Comment not found" });
    }

    const comment = existing[0];
    // check ownership or manager status
    if (req.user.role !== "MANAGER" && comment.user_id !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized to edit this comment" });
    }

    await pool.query("UPDATE ticket_comments SET content = ? WHERE id = ?", [content.trim(), id]);

    res.status(200).json({ success: true, message: "Comment updated" });
});

const deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const [existing] = await pool.query("SELECT * FROM ticket_comments WHERE id = ?", [id]);
    if (!existing.length) {
        return res.status(404).json({ message: "Comment not found" });
    }

    const comment = existing[0];
    if (req.user.role !== "MANAGER" && comment.user_id !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized to delete this comment" });
    }

    await pool.query("DELETE FROM ticket_comments WHERE id = ?", [id]);
    res.status(204).send();
});

module.exports = { addComment, getComments, updateComment, deleteComment };
