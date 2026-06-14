
let requests =
JSON.parse(
localStorage.getItem("requests")
) || [];



function popup(msg){

const p =
document.getElementById("popup");

if(!p) return;

p.innerText = msg;

p.style.display = "block";

setTimeout(()=>{

p.style.display =
"none";

},2500);

}




function render(){

const table =
document.getElementById(
"requestTable"
);

if(!table) return;

table.innerHTML="";

if(requests.length===0){

table.innerHTML=`

<tr>

<td colspan="4">

No requests submitted

</td>

</tr>

`;

return;

}


requests.forEach(r=>{

table.innerHTML += `

<tr>

<td>${r.name}</td>

<td>${r.location}</td>

<td>${r.phone}</td>

<td
class="status-${(
r.status ||
"pending"
).toLowerCase()}">

${r.status}

</td>

</tr>

`;

});


localStorage.setItem(

"requests",

JSON.stringify(
requests
)

);

}




function unlockForm(){

const user =

JSON.parse(

localStorage
.getItem(
"user"
)

);


if(user){

document

.getElementById(
"request"
)

?.classList

.remove(
"hidden"
);


const logged =

document

.getElementById(
"loggedUser"
);


if(logged){

logged.innerHTML =

`Logged in:
${user.name}`;

}

}

}



document
.getElementById(
"loginForm"
)
?.addEventListener(

"submit",

async function(e){

e.preventDefault();

try{

const response =

await fetch(

"http://localhost:3000/api/auth",

{

method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:

JSON.stringify({

fullName:

document
.getElementById(
"userName"
).value,

email:

document
.getElementById(
"userEmail"
).value,

password:

document
.getElementById(
"userPassword"
).value

})

}

);


const result =
await response.json();


if(!response.ok){

popup(
result.message
);

return;

}


localStorage.setItem(

"user",

JSON.stringify(
result.user
)

);

unlockForm();

popup(
result.message
);

this.reset();

}

catch(err){

console.log(err);

popup(
"Server unavailable"
);

}

});



document

.getElementById(
"wasteForm"
)

?.addEventListener(

"submit",

async function(e){

e.preventDefault();


const data={

name:

document
.getElementById(
"fullName"
).value,


location:

document
.getElementById(
"location"
).value,


phone:

document
.getElementById(
"phone"
).value,


email:

document
.getElementById(
"email"
).value,


wasteType:

document
.getElementById(
"wasteType"
).value,


additionalInfo:

document
.getElementById(
"additionalInfo"
).value,


date:

new Date()
.toLocaleDateString(),


status:
"Pending"

};


try{

const response =

await fetch(

"http://localhost:3000/api/requests",

{

method:
"POST",

headers:{

"Content-Type":
"application/json"

},

body:

JSON.stringify(
data
)

}

);


if(!response.ok){

throw new Error(
"Submit failed"
);

}


requests.unshift(
data
);

render();

this.reset();


popup(
"Request submitted"
);

}

catch(err){

console.error(
err
);


popup(

"Server connection failed"

);

}

}

);



unlockForm();

render();


//Admin Dashboard
app.get("/api/admin/requests", (req,res)=>{

db.query(
"SELECT * FROM requests ORDER BY id DESC",
(err,rows)=>{

if(err)
return res.status(500).json(err);

res.json(rows);

});

});



//Admin Actions

app.put("/api/admin/requests/:id", (req,res)=>{

const {status, truck, admin} = req.body;

db.query(
`
UPDATE requests
SET status=?,
assigned_truck=?,
approved_by=?
WHERE id=?
`,
[status, truck, admin, req.params.id],

(err)=>{

if(err)
return res.status(500).json(err);

res.json({message:"Request updated"});

}

);

});

//Logout function
function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    window.location.href = "index.html";
}
