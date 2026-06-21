const API_BASE = "https://m-wastesystem-1.onrender.com";

let requests = [];

// ======================
// POPUP
// ======================
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
// LOAD REQUESTS
// ======================
async function loadRequestsFromDB(){
try{
const res = await fetch(`${API_BASE}/api/requests`);
if(!res.ok) throw new Error("Failed");

requests = await res.json();
render();
}catch(err){
console.log(err);
popup("Failed to load requests");
}
}

// ======================
// RENDER
// ======================
function render(){
const table = document.getElementById("requestTable");
if(!table) return;

table.innerHTML = "";

if(requests.length === 0){
table.innerHTML = `<tr><td colspan="4">No requests submitted</td></tr>`;
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
// LOGIN
// ======================
document.getElementById("loginForm")?.addEventListener("submit", async (e)=>{
e.preventDefault();

try{
const response = await fetch(`${API_BASE}/api/auth`,{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({
fullName: document.getElementById("userName").value,
email: document.getElementById("userEmail").value,
password: document.getElementById("userPassword").value
})
});

const result = await response.json();

if(!response.ok){
popup(result.message || "Login failed");
return;
}

localStorage.setItem("user", JSON.stringify(result.user));

if(result.message === "Account created"){
popup("Account created successfully. You are now logged in.");
}else{
popup("Login successful");
}


function unlockForm(){
const user = JSON.parse(localStorage.getItem("user"));
if(!user) return;

document.getElementById("request")?.classList.remove("hidden");

const logged = document.getElementById("loggedUser");
if(logged){
logged.innerHTML = `Logged in as: ${user.name}`;
}
}

}catch(err){
console.log(err);
popup("Server unavailable");
}
});

// ======================
// SUBMIT REQUEST
// ======================
document.getElementById("wasteForm")?.addEventListener("submit", async (e)=>{
e.preventDefault();

try{
const data = {
name: document.getElementById("fullName").value,
location: document.getElementById("location").value,
phone: document.getElementById("phone").value,
email: document.getElementById("email").value,
wasteType: document.getElementById("wasteType").value,
additionalInfo: document.getElementById("additionalInfo").value
};

const response = await fetch(`${API_BASE}/api/requests`,{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify(data)
});

const result = await response.json();

if(!response.ok){
popup(result.message || "Failed");
return;
}

popup("Request submitted");
loadRequestsFromDB();
e.target.reset();

}catch(err){
console.log(err);
popup("Server connection failed");
}
});

// ======================
// INIT
// ======================
loadRequestsFromDB();const API_BASE = "https://m-wastesystem-1.onrender.com";

let requests = [];

// ======================
// POPUP
// ======================
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
// LOAD REQUESTS
// ======================
async function loadRequestsFromDB(){
try{
const res = await fetch(`${API_BASE}/api/requests`);
if(!res.ok) throw new Error("Failed");

requests = await res.json();
render();
}catch(err){
console.log(err);
popup("Failed to load requests");
}
}

// ======================
// RENDER
// ======================
function render(){
const table = document.getElementById("requestTable");
if(!table) return;

table.innerHTML = "";

if(requests.length === 0){
table.innerHTML = `<tr><td colspan="4">No requests submitted</td></tr>`;
return;
}

requests.forEach(r=>{
table.innerHTML += `
<tr>
<td>${r.name || "-"}</td>
<td>${r.location || "-"}</td>
<td>${r.phone || "-"}</td>
<td class="status-${(r.status || "pending").toLowerCase()}">
${r.status || "Pending"}
</td>
</tr>
`;
});
}

// ======================
// UNLOCK UI AFTER LOGIN
// (FIXED + GLOBAL)
// ======================
function unlockForm(){

const user = JSON.parse(localStorage.getItem("user"));
if(!user) return;

// show request form
document.getElementById("request")?.classList.remove("hidden");

// hide auth section (IMPORTANT FIX)
document.getElementById("auth").style.display = "none";

// show logged user
const logged = document.getElementById("loggedUser");
if(logged){
logged.innerHTML = `Logged in as: ${user.name}`;
}

}

// ======================
// LOGIN / REGISTER
// ======================
document.getElementById("loginForm")?.addEventListener("submit", async (e)=>{
e.preventDefault();

try{

const response = await fetch(`${API_BASE}/api/auth`,{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({
fullName: document.getElementById("userName").value,
email: document.getElementById("userEmail").value,
password: document.getElementById("userPassword").value
})
});

const result = await response.json();

if(!response.ok){
popup(result.message || "Login failed");
return;
}

// SAVE USER
localStorage.setItem("user", JSON.stringify(result.user));

// IMPORTANT: SWITCH UI STATE
unlockForm();

// FEEDBACK
if(result.message === "Account created"){
popup("Account created successfully. You are now logged in.");
}else{
popup("Login successful");
}

// reset form
e.target.reset();

// refresh data
loadRequestsFromDB();

}catch(err){
console.log(err);
popup("Server unavailable");
}

});

// ======================
// SUBMIT REQUEST
// ======================
document.getElementById("wasteForm")?.addEventListener("submit", async (e)=>{
e.preventDefault();

try{

const data = {
name: document.getElementById("fullName").value,
location: document.getElementById("location").value,
phone: document.getElementById("phone").value,
email: document.getElementById("email").value,
wasteType: document.getElementById("wasteType").value,
additionalInfo: document.getElementById("additionalInfo").value
};

const response = await fetch(`${API_BASE}/api/requests`,{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify(data)
});

const result = await response.json();

if(!response.ok){
popup(result.message || "Failed");
return;
}

popup("Request submitted");

// reload from DB (important fix)
loadRequestsFromDB();

e.target.reset();

}catch(err){
console.log(err);
popup("Server connection failed");
}

});

// ======================
// INIT
// ======================
window.addEventListener("load", ()=>{
unlockForm();        // auto-login if user exists
loadRequestsFromDB();
});