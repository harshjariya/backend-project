const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const asyncHandler = require("../middleware/asyncHandler");

const createUser = asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body;

    
    const [conflict] = await pool.query(
        "SELECT id FROM users WHERE email = ? OR username = ?",
        [email, username]
    );

    if (conflict.length) {
        return res.status(409).json({ message: "Registration failed: User already exists with this email or username" });
    }

    
    const saltFactor = 12;
    const passwordHash = await bcrypt.hash(password, saltFactor);

    
    const selectedRole = (role || "USER").toUpperCase();
    const [roleRef] = await pool.query("SELECT id FROM roles WHERE name = ?", [selectedRole]);

    if (!roleRef.length) {
        return res.status(400).json({ message: "Specified role is not recognized by the system" });
    }

    const [insertStatus] = await pool.query(
        "INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)",
        [username.trim(), email.trim().toLowerCase(), passwordHash, roleRef[0].id]
    );

    res.status(201).json({
        success: true,
        message: "Account created successfully",
        user: {
            id: insertStatus.insertId,
            username: username.trim(),
            email: email.trim().toLowerCase(),
            role: selectedRole
        }
    });
});

const getAllUsers = asyncHandler(async (req, res) => {
    const [userList] = await pool.query(
        `SELECT u.id, u.username, u.email, r.name as role, u.created_at
         FROM users u 
         JOIN roles r ON u.role_id = r.id
         ORDER BY u.created_at DESC`
    );

    res.status(200).json({ success: true, count: userList.length, data: userList });
});

module.exports = { createUser, getAllUsers };
