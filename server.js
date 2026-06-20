require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");





const app = express();
const port = process.env.PORT || 10000; //Default port for Render.(Dynamic port for Render)

// middleware FIRST
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));



// Homepage route to run the page public other than the local host.
app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, "public", "index.html"));
});



// MYSQL CONNECTION

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 4000,

  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: false
  }
});

db.connect((err) => {
  if (err) {
    console.log(
      "Database not connected:",
      err.message
    );
    return;
  }

  console.log(
    "MySQL Database has connected Successfully"
  );
});

// REGISTER + LOGIN Page



app.post("/api/auth", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "All fields required"
      });
    }

    db.query(
      `SELECT * FROM Requesters WHERE email = ?`,
      [email],
      async (err, rows) => {

        if (err) {
          console.log("DB ERROR:", err);
          return res.status(500).json({
            message: "Database error"
          });
        }

        // =====================
        // LOGIN EXISTING USER
        // =====================
        if (rows.length > 0) {
          const user = rows[0];

          const ok = await bcrypt.compare(password, user.password_hash);

          if (!ok) {
            return res.status(401).json({
              message: "You have entered an invalid password, please try again"
            });
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

        // =====================
        // REGISTER NEW USER
        // =====================
        const hash = await bcrypt.hash(password, 10);

        db.query(
          `INSERT INTO Requesters (full_name, email, password_hash)
           VALUES (?, ?, ?)`,
          [fullName, email, hash],
          (err, result) => {

            if (err) {
              console.log("INSERT ERROR:", err);
              return res.status(500).json({
                message: "Account creation failed"
              });
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
    console.log("SERVER ERROR:", err);
    res.status(500).json({
      message: "Server error"
    });
  }
});



//ADMIN LOGIN PAGE

app.post("/api/admin/login", (req,res)=>{

const {username, password} = req.body;

db.query(
"SELECT * FROM admins WHERE username=?",
[username],
async(err,rows)=>{

if(err) return res.status(500).json(err);

if(rows.length===0)
return res.status(401).json({message:"Invalid admin"});

const admin = rows[0];

const ok = await bcrypt.compare(password, admin.password_hash);

if(!ok)
return res.status(401).json({message:"Wrong password"});

res.json({
message:"Admin login success",
admin:{
id: admin.id,
username: admin.username
}
});

});

});



// =====================
// SAVE REQUEST
// =====================
app.post("/api/requests", (req,res)=>{

const {
name,
location,
phone,
email,
wasteType,
additionalInfo
} = req.body;s


// VALIDATION
if(!name || !location || !phone || !email || !wasteType){
return res.status(400).json({
message:"Required fields missing"
});
}


const sql = `
INSERT INTO requests
(name, location, phone, email, wasteType, additionalInfo, status)
VALUES (?, ?, ?, ?, ?, ?, ?)
`;

db.query(sql, [
  name,
  location,
  phone,
  email,
  wasteType,
  additionalInfo || "",
  "Pending"
], (err, result) => {

  if (err) {
    console.log("INSERT ERROR:", err.sqlMessage || err);
    return res.status(500).json({
      message: "Insert failed"
    });
  }

  res.json({
    message: "Request for waste collection has been sent successfully",
    id: result.insertId
  });
});


// =====================
// GET ALL REQUESTS
// =====================

app.get("/api/requests", (req, res) => {

  const email = req.query.email;

  // =====================
  // USER VIEW
  // =====================
  if (email) {

    db.query(
      `SELECT * FROM requests WHERE email = ? ORDER BY id DESC`,
      [email],
      (err, rows) => {

        if (err) {
          console.log("GET USER REQUESTS ERROR:", err);
          return res.status(500).json([]);
        }

        res.json(rows);
      }
    );

    return;
  }

  // =====================
  // ADMIN VIEW
  // =====================
  db.query(
    `SELECT * FROM requests ORDER BY id DESC`,
    (err, rows) => {

      if (err) {
        console.log("GET ADMIN REQUESTS ERROR:", err);
        return res.status(500).json([]);
      }

      res.json(rows);
    }
  );

});

//Admin Actions

//Approve Requests

app.put("/api/requests/approve/:id",(req,res)=>{

db.query(
"UPDATE requests SET status='Approved' WHERE id=?",
[req.params.id],
(err)=>{

if(err) return res.status(500).json(err);

res.json({message:"Approved"});

});

});



//Assign a truck to a request

app.put("/api/requests/assign/:id",(req,res)=>{

const { truck } = req.body;

db.query(
"UPDATE requests SET assigned_truck=? WHERE id=?",
[truck, req.params.id],
(err)=>{

if(err) return res.status(500).json(err);

res.json({message:"Truck assigned"});

});

});


//Reject Requests

app.put("/api/requests/reject/:id", (req, res) => {

const { id } = req.params;

const sql =
"UPDATE requests SET status='Rejected' WHERE id=?";

db.query(sql, [id], (err, result) => {

if (err) {
console.log(err);
return res.status(500).json({
message: "Reject failed"
});
}

res.json({
message: "Request rejected"
});

});

});


//Save approval/Assigned detaails in Database


app.put("/api/requests/:id", (req,res)=>{

const { status, truck } = req.body;

let fields = [];
let values = [];

if(status !== undefined){
fields.push("status=?");
values.push(status);
}

if(truck !== undefined){
fields.push("assigned_truck=?");
values.push(truck);
}

if(fields.length === 0){
return res.status(400).json({
message:"No update data"
});
}

const sql = `
UPDATE requests
SET ${fields.join(", ")}
WHERE id=?
`;

values.push(req.params.id);

db.query(sql, values, (err,result)=>{

if(err){
console.log(err);
return res.status(500).json({
message:"Update failed"
});
}

res.json({message:"updated"});

});

});

// =====================
// START SERVER
// =====================
app.listen(
port,

() => {

console.log(
`Server running on ${port}`
);

}

);