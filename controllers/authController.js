const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const asyncHandler = require("../middleware/asyncHandler");

const signUserToken = (payload) => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );
};

exports.login = asyncHandler(async (req, res) => {
    let { email, password } = req.body;

    email = email ? email.trim().toLowerCase() : "";

    console.log(`[auth] Login attempt: ${email}`);

    const [rows] = await pool.query(
        `SELECT u.*, r.name as role FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE u.email = ?`,
        [email]
    );

    if (!rows.length) {
        console.warn(`[auth] Login failed: User not found (${email})`);
        return res.status(401).json({ message: "Authentication failed: Invalid credentials" });
    }


    const userData = rows[0];
    const isMatch = await bcrypt.compare(password, userData.password);

    if (!isMatch) {
        console.warn(`[auth] Login failed: Password mismatch for ${email}`);
        return res.status(401).json({ message: "Authentication failed: Invalid credentials" });
    }


    const tokenPayload = {
        id: userData.id,
        role: userData.role,
        username: userData.username,
        email: userData.email
    };

    const accessToken = signUserToken(tokenPayload);

    const cookieOpts = {
        httpOnly: true,
        expires: new Date(Date.now() + 8 * 3600000), // 8 hours
        secure: process.env.NODE_ENV === "production"
    };

    res.cookie("token", accessToken, cookieOpts);

    res.status(200).json({
        success: true,
        token: accessToken,
        user: {
            id: userData.id,
            username: userData.username,
            role: userData.role
        }
    });
});

exports.logout = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Session cleared" });
};
