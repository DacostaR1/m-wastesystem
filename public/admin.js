
//Admin Dashboard 
//Get requests from server and render in table

app.get("/api/admin/requests", (req,res)=>{

db.query(
"SELECT * FROM requests ORDER BY id DESC",
(err,rows)=>{

if(err){
console.log(err);
return res.status(500).json([]);
}

res.json(rows);

});

});


//Admin Actions

app.put("/api/admin/requests/:id", (req,res)=>{

const { status, truck, admin } = req.body;

// Build dynamic update (prevents overwriting nulls)
let sql = "UPDATE requests SET ";
let values = [];

if(status !== undefined){
sql += "status=?, ";
values.push(status);
}

if(truck !== undefined){
sql += "assigned_truck=?, ";
values.push(truck);
}

if(admin !== undefined){
sql += "approved_by=?, ";
values.push(admin);
}


sql = sql.replace(/, $/, "");

sql += " WHERE id=?";
values.push(req.params.id);

db.query(sql, values, (err)=>{

if(err){
console.log(err);
return res.status(500).json({
message:"Update failed"
});
}

res.json({
message:"Request updated successfully"
});

});

});


//admin logic workflow
function loadRequests(){

fetch("/api/admin/requests")
.then(r=>r.json())
.then(data=>{

const table =
document.getElementById("requestTable");

table.innerHTML="";

data.forEach(r=>{

table.innerHTML += `
<tr>

<td>${r.id}</td>
<td>${r.name}</td>
<td>${r.phone}</td>
<td>${r.location}</td>
<td>${r.wasteType}</td>
<td>${r.status}</td>

<td>
<input id="truck-${r.id}" placeholder="Truck">
</td>

<td>

<button onclick="updateRequest(${r.id},'Approved')">
Approve
</button>

<button onclick="updateRequest(${r.id},'Rejected')">
Reject
</button>

<button onclick="assignTruck(${r.id})">
Assign Truck
</button>

</td>

</tr>
`;

});

});

}
