const jwt = require("jsonwebtoken");
const pool = require("../config/db");


const verifyToken = async (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.email, u.role_id, r.name AS role
       FROM users u JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
}

module.exports = { verifyToken, authorizeRoles };
