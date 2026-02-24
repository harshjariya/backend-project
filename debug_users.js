require("dotenv").config();
const pool = require("./config/db");
async function checkUsers() {
    try {
        const [rows] = await pool.query("SELECT id, email, username FROM users");
        console.log("USERS_JSON:" + JSON.stringify(rows));
        process.exit(0);
    } catch (err) {
        console.error("Error checking users:", err.message);
        process.exit(1);
    }
}
checkUsers();
