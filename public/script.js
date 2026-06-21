// ======================
// CONFIG
// ======================

// SAME DOMAIN (Render serves frontend + backend)
const API_BASE = window.location.origin;

// If frontend/backend separated use:
// const API_BASE = "https://YOUR-APP.onrender.com";

let requests = [];


// ======================
// POPUP
// ======================
function popup(msg){

const p =
document.getElementById("popup");

if(!p) return;

p.innerText = msg;

p.style.display =
"block";

setTimeout(()=>{

p.style.display =
"none";

},2500);

}


// ======================
// LOAD REQUESTS
// ======================
async function loadRequestsFromDB(){

try{

const res =
await fetch(
`${API_BASE}/api/requests`
);

if(!res.ok){

throw new Error(
"Failed to fetch"
);

}

requests =
await res.json();

render();

}catch(err){

console.log(
"LOAD ERROR:",
err
);

popup(
"Failed to load requests"
);

}

}


// ======================
// RENDER TABLE
// ======================
function render(){

const table =
document.getElementById(
"requestTable"
);

if(!table) return;

table.innerHTML = "";

if(
!requests ||
requests.length===0
){

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

<td>
${r.name || "-"}
</td>

<td>
${r.location || "-"}
</td>

<td>
${r.phone || "-"}
</td>

<td class="
status-${
(r.status || "pending")
.toLowerCase()
}
">

${r.status || "Pending"}

</td>

</tr>

`;

});

}


// ======================
// SHOW REQUEST FORM
// ======================
function unlockForm(){

const user =
JSON.parse(
localStorage.getItem(
"user"
)
);

if(!user) return;

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

logged.innerHTML=
`Logged in as:
${user.name}`;

}

}


// ======================
// LOGIN / REGISTER
// ======================
document
.getElementById(
"loginForm"
)
?.addEventListener(
"submit",

async function(e){

e.preventDefault();

try{

const payload = {

fullName:
document
.getElementById(
"userName"
)
.value
.trim(),

email:
document
.getElementById(
"userEmail"
)
.value
.trim(),

password:
document
.getElementById(
"userPassword"
)
.value

};

const response =
await fetch(
`${API_BASE}/api/auth`,
{
method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:
JSON.stringify(
payload
)
}
);

const result =
await response.json();

console.log(
result
);

if(
!response.ok
){

popup(
result.message ||
"Login failed"
);

return;

}

localStorage.setItem(
"user",
JSON.stringify(
result.user
)
);

popup(
result.message
);

unlockForm();

this.reset();

await loadRequestsFromDB();

}catch(err){

console.log(
"LOGIN ERROR",
err
);

popup(
"Server unavailable"
);

}

});


// ======================
// SUBMIT REQUEST
// ======================
document
.getElementById(
"wasteForm"
)
?.addEventListener(
"submit",

async function(e){

e.preventDefault();

try{

const data={

name:
document
.getElementById(
"fullName"
)
.value
.trim(),

location:
document
.getElementById(
"location"
)
.value
.trim(),

phone:
document
.getElementById(
"phone"
)
.value
.trim(),

email:
document
.getElementById(
"email"
)
.value
.trim(),

wasteType:
document
.getElementById(
"wasteType"
)
.value,

additionalInfo:
document
.getElementById(
"additionalInfo"
)
.value
.trim()

};

const response =
await fetch(
`${API_BASE}/api/requests`,
{
method:"POST",

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

const result =
await response.json();

if(
!response.ok
){

popup(
result.message ||
"Submission failed"
);

return;

}

popup(
"Request submitted successfully"
);

this.reset();

await loadRequestsFromDB();

}catch(err){

console.log(
"REQUEST ERROR",
err
);

popup(
"Server connection failed"
);

}

});


// ======================
// LOGOUT
// ======================
function logout(){

localStorage.removeItem(
"user"
);

localStorage.removeItem(
"admin"
);

window.location.href =
"/";

}


// ======================
// START
// ======================
window.addEventListener(
"load",
()=>{

unlockForm();

loadRequestsFromDB();

}
);