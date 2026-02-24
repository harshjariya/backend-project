require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("./config/db");

async function testLogin() {
    const email = "admin@system.local";
    const password = "adminPass123";

    try {
        const [rows] = await pool.query(
            `SELECT u.*, r.name as role FROM users u
             JOIN roles r ON u.role_id = r.id
             WHERE u.email = ?`,
            [email]
        );

        if (!rows.length) {
            console.log("TEST_RESULT: USER_NOT_FOUND");
            process.exit(0);
        }

        const userData = rows[0];
        const isMatch = await bcrypt.compare(password, userData.password);

        console.log("TEST_RESULT: " + (isMatch ? "SUCCESS" : "PASSWORD_MISMATCH"));
        process.exit(0);
    } catch (err) {
        console.error("TEST_ERROR:", err.message);
        process.exit(1);
    }
}
testLogin();
