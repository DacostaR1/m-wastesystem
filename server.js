require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");
const { sendNotification } = require("./notificationservice");


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


// MYSQL CONNECTION 

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),

    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,

    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 20000
});

// Test connection
db.getConnection((err, connection) => {

    if (err) {
        console.error("Database connection failed");
        console.error(err);
        return;
    }

    console.log("MySQL Database connected successfully");

    connection.query("SELECT 1", (err, rows) => {

        if (err) {
            console.error("Database test failed", err);
        } else {
            console.log("Database Test passed:", rows);
        }

        connection.release();
    });

});

module.exports = db;

// =====================
// AUTH (REGISTER + LOGIN)
// =====================

app.post("/api/auth", async (req, res) => {

try{

console.log("BODY:", req.body);

const {
fullName,
email,
password
}=req.body;

if(
!fullName ||
!email ||
!password
){

return res
.status(400)
.json({
message:
"Missing fields"
});

}

db.query(

"SELECT * FROM requesters WHERE email=?",

[email],

async (
err,
rows
)=>{

if(err){

console.error(
"DB SELECT ERROR:",
err
);

return res
.status(500)
.json({
message:
err.message
});

}

console.log(
"Rows:",
rows.length
);


// LOGIN
if(
rows.length>0
){

const user=
rows[0];

console.log(
"User found"
);

const ok=
await bcrypt.compare(
password,
user.password_hash
);

console.log(
"Password match:",
ok
);

if(!ok){

return res
.status(401)
.json({
message:
"Invalid password"
});

}

return res.json({

message:
"Login successful",

user:{

id:user.id,

name:
user.full_name,

email:
user.email

}

});

}


// REGISTER
const hash=
await bcrypt.hash(
password,
10
);

db.query(

`INSERT INTO requesters
(full_name,email,password_hash)
VALUES(?,?,?)`,

[
fullName,
email,
hash
],

(
err,
result
)=>{

if(err){

console.error(
"INSERT ERROR:",
err
);

return res
.status(500)
.json({
message:
err.message
});

}

return res.json({

message:
"Account created",

user:{

id:
result.insertId,

name:
fullName,

email

}

});

}

);

}

);

}catch(err){

console.error(
"AUTH ERROR:",
err
);

res
.status(500)
.json({
message:
err.message
});

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
  } = req.body; 

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

//Staff Feedback route to the MySql


app.post("/api/staff-feedback", (req, res) => {

  const {
    full_name,
    role,
    email,
    phone,
    department,
    work_location,
    comments
  } = req.body;

 
  if (!full_name || !role || !work_location || !comments) {
    return res.status(400).json({
      message: "Missing required fields"
    });
  }

  const sql = `
    INSERT INTO staff_feedback
    (full_name, role, email, phone, department, work_location, comments)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      full_name,
      role,
      email || null,
      phone || null,
      department || null,
      work_location,
      comments
    ],
    (err, result) => {

      if (err) {
        console.error("Failed to save your feedback:", err.code, err.message);
        return res.status(500).json({
          message: "Database error"
        });
      }

      res.status(201).json({
        message: "Feedback saved successfully",
        id: result.insertId
      });
    }
  );
});


//Save customer feedback to database

app.post("/api/customer-feedback", (req, res) => {

  const {
    collection_date,
    cat,
    gender,
    age,
    location,

    freq,
    sat,

    delayed_collection,
    poor_communication,
    missed_pickups,
    high_cost,
    other_challenge,

    phone,
    app,
    digital,

    requests,
    monitoring,

    comments
  } = req.body;

  const sql = `
    INSERT INTO customer_feedback (
      collection_date,
      respondent_category,
      gender,
      age_range,
      location_zone,

      waste_frequency,
      satisfaction_level,

      delayed_collection,
      poor_communication,
      missed_pickups,
      high_cost,
      other_challenge,

      has_smartphone,
      app_comfort,
      willing_digital_system,

      feature_requests,
      feature_monitoring,

      comments
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

  db.query(sql, [
    collection_date,
    cat,
    gender,
    age,
    location,

    freq,
    sat,

    delayed_collection ? 1 : 0,
    poor_communication ? 1 : 0,
    missed_pickups ? 1 : 0,
    high_cost ? 1 : 0,
    other_challenge,

    phone,
    app,
    digital,

    requests ? 1 : 0,
    monitoring ? 1 : 0,

    comments
  ], (err, result) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Insert failed" });
    }

    res.json({
      message: "Feedback saved successfully",
      id: result.insertId
    });
  });
});

// GET REQUESTS (USER + ADMIN)


app.get("/api/requests", (req, res) => {
  const email = req.query.email;

  if (email) {
    db.query(
      "SELECT * FROM requests WHERE email = ? ORDER BY id ASC",
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
    "SELECT * FROM requests ORDER BY id desc",
    (err, rows) => {
      if (err) {
        return res.status(500).json([]);
      }
      res.json(rows);
    }
  );
});



//Admin Actions ROUTE

// =====================
// ADMIN UPDATE REQUEST
// =====================
app.put("/api/admin/requests/:id", (req, res) => {
console.log("******** ADMIN ROUTE EXECUTED ********");
    console.log("==================================");
    console.log("ADMIN UPDATE ROUTE HIT");
    console.log("Request ID:", req.params.id);
    console.log("Body:", req.body);
    console.log("==================================");

  const { status, truck, admin, reason, remarks } = req.body;
const requestId = req.params.id;

    let sql = "UPDATE requests SET ";
    let values = [];

    if (status !== undefined) {
        sql += "status=?, ";
        values.push(status);
    }

    if (truck !== undefined) {
        sql += "assigned_truck=?, ";
        values.push(truck);
    }

    if (admin !== undefined) {
        sql += "action_by=?, ";
        values.push(admin);
    }

    if (remarks !== undefined) {
        sql += "approver_remarks=?, ";
        values.push(remarks);
    }

    if (reason !== undefined) {
        sql += "rejection_reason=?, ";
        values.push(reason);
    }

    // Nothing to update
    if (values.length === 0) {
        return res.status(400).json({
            message: "No update data supplied."
        });
    }

    sql = sql.replace(/, $/, "");

    sql += " WHERE id=?";
    values.push(requestId);

    console.log("SQL:", sql);
    console.log("VALUES:", values);

    db.query(sql, values, (err) => {

        if (err) {
            console.error("DATABASE UPDATE ERROR");
            console.error(err);

            return res.status(500).json({
                message: err.message,
                code: err.code,
                sqlMessage: err.sqlMessage
            });
        }

        // Return success immediately
        res.json({
            success: true,
            message: "Request updated successfully."
        });

        // =====================
        // SEND EMAIL (background)
        // =====================

        db.query(
            "SELECT name,email FROM requests WHERE id=?",
            [requestId],
            async (err, rows) => {

                if (err) {
                    console.error("Customer lookup failed:", err);
                    return;
                }

                if (rows.length === 0) {
                    return;
                }

                const customer = rows[0];

                try {

                    if (status === "Approved") {

                        await sendNotification(
                          
                            customer.email,
                            "Waste Collection Request Approved",
                            `
                            <h2>Mobile Waste Collection System - Rubaga</h2>

                            <p>Hello ${customer.name},</p>

                            <p>Your waste collection request has been
                            <b style="color:green;">APPROVED</b>.</p>

                            <p>${remarks || ""}</p>
                            `
                        );

                    }

                    if (status === "Rejected") {

                        await sendNotification(
                            customer.email,
                            "Waste Collection Request Rejected",
                            `
                            <h2>Mobile Waste Collection System - Rubaga</h2>

                            <p>Hello ${customer.name},</p>

                            <p>Your waste collection request has been
                            <b style="color:red;">REJECTED</b>.</p>

                            <p><b>Reason:</b> ${reason || "Not specified"}</p>
                            `
                        );

                    }

                    if (truck) {

                        await sendNotification(
                            customer.email,
                            "Truck Assigned",
                            `
                            <h2>Mobile Waste Collection System - Rubaga</h2>

                            <p>Hello ${customer.name},</p>

                            <p>Your waste collection truck has been assigned.</p>

                            <p><b>Truck Number:</b> ${truck}</p>
                            `
                        );

                    }

                } catch (emailError) {

                    console.error("EMAIL ERROR:", emailError.message);

                }

            }
        );

    });

});

// UPDATE FLEXIBLE  /Dashboard feeds
//
app.put("/api/requests/:id", (req, res) => {
  const { status, truck, admin, reason } = req.body;

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




// START SERVER //

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});