const pool = require("./db");

/**
 * Ensures all required database tables exist and seeds the roles.
 * Runs during application startup.
 */
async function initializeDatabaseSchema() {
  const connection = await pool.getConnection();

  try {
    console.log("[db] Initializing schema...");

    // RBAC Roles Definition
    await connection.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(25) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB
        `);

    // Seed core roles if table is empty
    const [roleCheck] = await connection.query("SELECT id FROM roles LIMIT 1");
    if (!roleCheck.length) {
      await connection.query("INSERT INTO roles (name) VALUES ('MANAGER'), ('SUPPORT'), ('USER')");
    }

    // Users Account Table
    await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(60) NOT NULL UNIQUE,
                email VARCHAR(120) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role_id INT NOT NULL DEFAULT 3,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
            ) ENGINE=InnoDB
        `);

    // Main Tickets Repository
    await connection.query(`
            CREATE TABLE IF NOT EXISTS tickets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
                priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
                created_by INT NOT NULL,
                assigned_to INT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB
        `);

    // Ticket Discussion/Comments
    await connection.query(`
            CREATE TABLE IF NOT EXISTS ticket_comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ticket_id INT NOT NULL,
                user_id INT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);

    // Status Transition Audit Logs
    await connection.query(`
            CREATE TABLE IF NOT EXISTS ticket_status_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ticket_id INT NOT NULL,
                changed_by INT NOT NULL,
                old_status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL,
                new_status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL,
                changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
                FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);

    console.log("[db] Database initialization completed.");
  } catch (error) {
    console.error("[db] Error initializing database:", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = initializeDatabaseSchema;
