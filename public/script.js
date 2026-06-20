let requests = [];

function popup(msg){
const p = document.getElementById("popup");

if(!p) return;

p.innerText = msg;
p.style.display = "block";

setTimeout(()=>{
p.style.display = "none";
},2500);
}

// ======================
// RENDER REQUEST TABLE
// ======================
function render(){

const table =
document.getElementById("requestTable");

if(!table) return;

table.innerHTML = "";

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

<td class="status-${(r.status || "pending").toLowerCase()}">
${r.status || "Pending"}
</td>

</tr>
`;

});

}

// ======================
// SHOW USER AREA
// ======================
function unlockForm(){

const user =
JSON.parse(
localStorage.getItem("user")
);

if(user){

document
.getElementById("request")
?.classList
.remove("hidden");

const logged =
document.getElementById("loggedUser");

if(logged){

logged.innerHTML =
`Logged in: ${user.name}`;

}

}

}

// ======================
// LOGIN / REGISTER
// ======================
document
.getElementById("loginForm")
?.addEventListener(
"submit",

async function(e){

e.preventDefault();

try{

const response =
await fetch(
"/api/auth",
{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

fullName:
document.getElementById("userName").value,

email:
document.getElementById("userEmail").value,

password:
document.getElementById("userPassword").value

})

}
);

const result =
await response.json();

if(!response.ok){

popup(result.message);

return;

}

localStorage.setItem(
"user",
JSON.stringify(result.user)
);

unlockForm();

popup(result.message);

this.reset();

}
catch(err){

console.log(err);

popup(
"Server unavailable"
);

}

}
);

// ======================
// SUBMIT REQUEST
// ======================
document
.getElementById("wasteForm")
?.addEventListener(
"submit",

async function(e){

e.preventDefault();

const data = {

name:
document.getElementById("fullName").value,

location:
document.getElementById("location").value,

phone:
document.getElementById("phone").value,

email:
document.getElementById("email").value,

wasteType:
document.getElementById("wasteType").value,

additionalInfo:
document.getElementById("additionalInfo").value

};

try{

const response =
await fetch(
"/api/requests",
{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body:
JSON.stringify(data)

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

requests.unshift({

...data,
status:"Pending"

});

render();

this.reset();

popup(
"Request submitted successfully"
);

}
catch(err){

console.log(err);

popup(
"Server connection failed"
);

}

}
);

// ======================
// LOGOUT
// ======================
function logout(){

localStorage.removeItem("user");

localStorage.removeItem("admin");

window.location.href =
"index.html";

}

unlockForm();

render();
