const pool = require("../config/db");
const asyncHandler = require("../middleware/asyncHandler");
const { STATUS_TRANSITIONS } = require("../middleware/validate");

const createTicket = asyncHandler(async (req, res) => {
    const { title, description, priority } = req.body;
    const authorId = req.user.id;
    const level = (priority || "MEDIUM").toUpperCase();

    const [insertResult] = await pool.query(
        "INSERT INTO tickets (title, description, priority, created_by) VALUES (?, ?, ?, ?)",
        [title.trim(), description.trim(), level, authorId]
    );

    res.status(201).json({
        success: true,
        data: {
            id: insertResult.insertId,
            title: title.trim(),
            description: description.trim(),
            status: "OPEN",
            priority: level,
            author: authorId
        }
    });
});

const getTickets = asyncHandler(async (req, res) => {
    const { role, id: currentId } = req.user;

    // pagination settings
    const pageNum = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.limit) || 15));
    const offsetRows = (pageNum - 1) * pageSize;

    const filterStatus = req.query.status?.toUpperCase();
    const filterPriority = req.query.priority?.toUpperCase();

    let sql = `
        SELECT t.*, creator.username as reporter, assignee.username as staff
        FROM tickets t
        LEFT JOIN users creator ON t.created_by = creator.id
        LEFT JOIN users assignee ON t.assigned_to = assignee.id
    `;

    let countSql = "SELECT COUNT(*) as total FROM tickets t";
    let whereParts = [];
    let queryArgs = [];

    if (role === "SUPPORT") {
        whereParts.push("t.assigned_to = ?");
        queryArgs.push(currentId);
    } else if (role === "USER") {
        whereParts.push("t.created_by = ?");
        queryArgs.push(currentId);
    }

    if (filterStatus) {
        whereParts.push("t.status = ?");
        queryArgs.push(filterStatus);
    }
    if (filterPriority) {
        whereParts.push("t.priority = ?");
        queryArgs.push(filterPriority);
    }

    if (whereParts.length) {
        const queryClause = " WHERE " + whereParts.join(" AND ");
        sql += queryClause;
        countSql += queryClause;
    }

    sql += " ORDER BY t.created_at DESC LIMIT ? OFFSET ?";

    const [counts] = await pool.query(countSql, queryArgs);
    const totalRecords = counts[0].total;
    const [ticketData] = await pool.query(sql, [...queryArgs, pageSize, offsetRows]);

    res.status(200).json({
        success: true,
        count: ticketData.length,
        pagination: {
            total: totalRecords,
            pages: Math.ceil(totalRecords / pageSize),
            current: pageNum,
            size: pageSize
        },
        data: ticketData
    });
});

const assignTicket = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { assigned_to } = req.body;

    if (!assigned_to) {
        return res.status(400).json({ message: "Staff ID is required for assignment" });
    }

    const [existing] = await pool.query("SELECT id FROM tickets WHERE id = ?", [id]);
    if (!existing.length) {
        return res.status(404).json({ message: "Ticket not found" });
    }

    const [targetUser] = await pool.query(
        "SELECT u.id, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?",
        [assigned_to]
    );

    if (!targetUser.length) {
        return res.status(404).json({ message: "Staff member not found" });
    }

    const targetRole = targetUser[0].role;
    if (targetRole !== "SUPPORT" && targetRole !== "MANAGER") {
        return res.status(400).json({ message: "Tickets can only be assigned to support or management staff" });
    }

    await pool.query("UPDATE tickets SET assigned_to = ? WHERE id = ?", [assigned_to, id]);

    res.status(200).json({ success: true, message: "Team member assigned successfully" });
});

const changeTicketStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const requestedStatus = req.body.status; 

    const [rows] = await pool.query("SELECT status FROM tickets WHERE id = ?", [id]);
    if (!rows.length) {
        return res.status(404).json({ message: "Ticket not found" });
    }

    const prevStatus = rows[0].status;
    const validNextSteps = STATUS_TRANSITIONS[prevStatus];

    if (!validNextSteps || !validNextSteps.includes(requestedStatus)) {
        return res.status(400).json({
            message: `Invalid workflow transition. Cannot move from ${prevStatus} to ${requestedStatus}.`
        });
    }

    await pool.query("UPDATE tickets SET status = ? WHERE id = ?", [requestedStatus, id]);

    // audit log
    await pool.query(
        "INSERT INTO ticket_status_logs (ticket_id, changed_by, old_status, new_status) VALUES (?, ?, ?, ?)",
        [id, req.user.id, prevStatus, requestedStatus]
    );

    res.status(200).json({
        success: true,
        message: `Status updated to ${requestedStatus}`,
        history: { from: prevStatus, to: requestedStatus }
    });
});

const deleteTicket = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const [found] = await pool.query("SELECT id FROM tickets WHERE id = ?", [id]);
    if (!found.length) {
        return res.status(404).json({ message: "Ticket does not exist" });
    }

    await pool.query("DELETE FROM tickets WHERE id = ?", [id]);
    res.status(204).send();
});

module.exports = {
    createTicket,
    getTickets,
    assignTicket,
    changeTicketStatus,
    deleteTicket
};
