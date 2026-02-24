require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("./config/db");
const initDb = require("./config/initDb");

/**
 * Seed script to bootstrap the system with default data.
 * It primarily creates the initial Manager account.
 */
async function bootstrapSystem() {
    console.log("Starting system bootstrap...");

    try {
        // Ensure database schema is initialized
        await initDb();

        const defaultAdminEmail = "admin@system.local";

        // Avoid duplicate seeding
        const [existingUsers] = await pool.query("SELECT id FROM users WHERE email = ?", [defaultAdminEmail]);
        if (existingUsers.length > 0) {
            console.log("[-] Bootstrap skip: Admin account already exists.");
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash("adminPass123", 12);

        // Fetch Manager role reference
        const [roleData] = await pool.query("SELECT id FROM roles WHERE name = 'MANAGER'");
        if (!roleData.length) {
            console.error("[!] Fatal: Essential roles not found in database.");
            process.exit(1);
        }

        const managerRoleId = roleData[0].id;

        await pool.query(
            "INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)",
            ["system_admin", defaultAdminEmail, passwordHash, managerRoleId]
        );

        console.log("[+] Bootstrap complete!");
        console.log(`[i] Created Admin: ${defaultAdminEmail} / Password: adminPass123`);

        process.exit(0);
    } catch (error) {
        console.error("[!] Bootstrap failed:", error.message);
        process.exit(1);
    }
}

bootstrapSystem();
