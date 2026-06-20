require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const port = process.env.PORT || 10000;

// =====================
// MIDDLEWARE
// =====================
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// =====================
// HOME ROUTE
// =====================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =====================
// MYSQL CONNECTION (FIXED FOR TIDB / RENDER)
// =====================
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 4000,

  ssl: {
    rejectUnauthorized: false
  },

  connectTimeout: 20000
});

db.connect((err) => {
  if (err) {
    console.log("Database not connected:", err.message);
    return;
  }
  console.log("MySQL Database connected successfully");
});

// =====================
// AUTH (REGISTER + LOGIN)
// =====================
app.post("/api/auth", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    db.query(
      "SELECT * FROM Requesters WHERE email = ?",
      [email],
      async (err, rows) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Database error" });
        }

        // LOGIN
        if (rows.length > 0) {
          const user = rows[0];

          const ok = await bcrypt.compare(password, user.password_hash);

          if (!ok) {
            return res.status(401).json({ message: "Invalid password" });
          }

          return res.json({
            message: "Login successful",
            user: {
              id: user.id,
              name: user.full_name,
              email: user.email
            }
          });
        }

        // REGISTER
        const hash = await bcrypt.hash(password, 10);

        db.query(
          "INSERT INTO Requesters (full_name, email, password_hash) VALUES (?, ?, ?)",
          [fullName, email, hash],
          (err, result) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ message: "Account creation failed" });
            }

            return res.json({
              message: "Account created",
              user: {
                id: result.insertId,
                name: fullName,
                email
              }
            });
          }
        );
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================
// ADMIN LOGIN
// =====================
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM admins WHERE username = ?",
    [username],
    async (err, rows) => {
      if (err) return res.status(500).json(err);

      if (rows.length === 0) {
        return res.status(401).json({ message: "Invalid admin" });
      }

      const admin = rows[0];
      const ok = await bcrypt.compare(password, admin.password_hash);

      if (!ok) {
        return res.status(401).json({ message: "Wrong password" });
      }

      res.json({
        message: "Admin login success",
        admin: {
          id: admin.id,
          username: admin.username
        }
      });
    }
  );
});

// =====================
// CREATE REQUEST
// =====================
app.post("/api/requests", (req, res) => {
  const {
    name,
    location,
    phone,
    email,
    wasteType,
    additionalInfo
  } = req.body; // ✅ FIXED (removed stray "s")

  if (!name || !location || !phone || !email || !wasteType) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  const sql = `
    INSERT INTO requests
    (name, location, phone, email, wasteType, additionalInfo, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      name,
      location,
      phone,
      email,
      wasteType,
      additionalInfo || null,
      "Pending"
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Insert failed" });
      }

      res.json({
        message: "Request submitted successfully",
        id: result.insertId
      });
    }
  );
});

// =====================
// GET REQUESTS (USER + ADMIN)
// =====================
app.get("/api/requests", (req, res) => {
  const email = req.query.email;

  if (email) {
    db.query(
      "SELECT * FROM requests WHERE email = ? ORDER BY id DESC",
      [email],
      (err, rows) => {
        if (err) {
          return res.status(500).json([]);
        }
        res.json(rows);
      }
    );
    return;
  }

  db.query(
    "SELECT * FROM requests ORDER BY id DESC",
    (err, rows) => {
      if (err) {
        return res.status(500).json([]);
      }
      res.json(rows);
    }
  );
});

// =====================
// APPROVE
// =====================
app.put("/api/requests/approve/:id", (req, res) => {
  db.query(
    "UPDATE requests SET status='Approved' WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Approved" });
    }
  );
});

// =====================
// REJECT
// =====================
app.put("/api/requests/reject/:id", (req, res) => {
  db.query(
    "UPDATE requests SET status='Rejected' WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Rejected" });
    }
  );
});

// =====================
// ASSIGN TRUCK
// =====================
app.put("/api/requests/assign/:id", (req, res) => {
  const { truck } = req.body;

  db.query(
    "UPDATE requests SET assigned_truck=? WHERE id=?",
    [truck, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Truck assigned" });
    }
  );
});

// =====================
// UPDATE FLEXIBLE
// =====================
app.put("/api/requests/:id", (req, res) => {
  const { status, truck } = req.body;

  let fields = [];
  let values = [];

  if (status !== undefined) {
    fields.push("status=?");
    values.push(status);
  }

  if (truck !== undefined) {
    fields.push("assigned_truck=?");
    values.push(truck);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: "No update data" });
  }

  const sql = `
    UPDATE requests
    SET ${fields.join(", ")}
    WHERE id=?
  `;

  values.push(req.params.id);

  db.query(sql, values, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Update failed" });
    }

    res.json({ message: "Updated" });
  });
});

// =====================
// START SERVER (RENDER SAFE)
// =====================
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});