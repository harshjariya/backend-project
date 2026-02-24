const VALID_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const STATUS_TRANSITIONS = {
    OPEN: ["IN_PROGRESS"],
    IN_PROGRESS: ["RESOLVED"],
    RESOLVED: ["CLOSED", "IN_PROGRESS"],
    CLOSED: []
};


const validateTicketCreation = (req, res, next) => {
    const { title, description, priority } = req.body;

    if (!title || title.trim().length < 5) {
        return res.status(400).json({ message: "Title is too short (min 5 chars)" });
    }

    if (!description || description.trim().length < 10) {
        return res.status(400).json({ message: "Description is too short (min 10 chars)" });
    }

    if (priority && !VALID_PRIORITIES.includes(priority.toUpperCase())) {
        return res.status(400).json({ message: `Priority must be one of: ${VALID_PRIORITIES.join(", ")}` });
    }

    next();
};

const validateStatusChange = (req, res, next) => {
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: "No status provided" });
    }

    const normalized = status.toUpperCase();
    if (!VALID_STATUSES.includes(normalized)) {
        return res.status(400).json({ message: "Invalid status value provided" });
    }

    req.body.status = normalized;
    next();
};


const validateComment = (req, res, next) => {
    const { content } = req.body;
    if (!content || !content.trim()) {
        return res.status(400).json({ message: "Comment content cannot be empty" });
    }
    next();
};


const validateUserCreation = (req, res, next) => {
    const { username, email, password, role } = req.body;

    if (!username || username.trim().length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ message: "A valid email address is required" });
    }

    if (!password || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    if (role && !["MANAGER", "SUPPORT", "USER"].includes(role.toUpperCase())) {
        return res.status(400).json({ message: "Invalid role specified" });
    }

    next();
};


const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Credentials (email/password) are required" });
    }
    next();
};

module.exports = {
    validateTicketCreation,
    validateStatusChange,
    validateComment,
    validateUserCreation,
    validateLogin,
    STATUS_TRANSITIONS,
    VALID_STATUSES,
    VALID_PRIORITIES
};
