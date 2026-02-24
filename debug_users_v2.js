require("dotenv").config();
const pool = require("./config/db");
async function checkUsers() {
    try {
        const [users] = await pool.query("SELECT * FROM users");
        const [roles] = await pool.query("SELECT * FROM roles");
        console.log("ROLES:", JSON.stringify(roles));
        users.forEach(u => {
            console.log("USER:", u.id, u.email, "ROLE_ID:", u.role_id);
        });
        process.exit(0);
    } catch (err) {
        console.error("Error checking users:", err.message);
        process.exit(1);
    }
}
checkUsers();
