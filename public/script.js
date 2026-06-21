
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
// LOAD REQUESTS FROM BACKEND (IMPORTANT)
// ======================
async function loadRequestsFromDB(){

try{

const res = await fetch("/api/requests");

if(!res.ok) throw new Error("API error");

requests = await res.json();

render();

}catch(err){

console.log(err);
popup("Failed to load requests from server");

}

}

// ======================
// RENDER TABLE
// ======================
function render(){

const table = document.getElementById("requestTable");
if(!table) return;

table.innerHTML = "";

if(requests.length === 0){

table.innerHTML = `
<tr>
<td colspan="4">No requests submitted</td>
</tr>
`;
return;

}

requests.forEach(r => {

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
// SHOW REQUEST FORM AFTER LOGIN
// ======================
function unlockForm(){

const user = JSON.parse(localStorage.getItem("user"));

if(user){

document.getElementById("request")
?.classList.remove("hidden");

const logged = document.getElementById("loggedUser");

if(logged){
logged.innerHTML = `Logged in as: ${user.name}`;
}

}

}

// ======================
// LOGIN / REGISTER
// ======================

document.getElementById("loginForm")
?.addEventListener("submit", async function(e){

e.preventDefault();

try{

const response = await fetch(`${API_BASE}/api/auth`, {
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
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

unlockForm();

popup(result.message || "Success");

this.reset();

loadRequestsFromDB();

}catch(err){

console.log(err);
popup("Server unavailable. Please try again later.");

}

});


// ======================
// SUBMIT WASTE REQUEST
// ======================
document.getElementById("wasteForm")
?.addEventListener("submit", async function(e){

e.preventDefault();

const data = {
name: document.getElementById("fullName").value,
location: document.getElementById("location").value,
phone: document.getElementById("phone").value,
email: document.getElementById("email").value,
wasteType: document.getElementById("wasteType").value,
additionalInfo: document.getElementById("additionalInfo").value
};

try{

const response = await fetch("/api/requests", {
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(data)
});

const result = await response.json();

if(!response.ok){
popup(result.message || "Submission failed");
return;
}

// reload from DB (IMPORTANT FIX)
await loadRequestsFromDB();

this.reset();

popup("Request submitted successfully");

}catch(err){

console.log(err);
popup("Server connection failed");

}

});

// ======================
// LOGOUT
// ======================
function logout(){

localStorage.removeItem("user");
localStorage.removeItem("admin");

window.location.href = "index.html";

}

// ======================
// INIT
// ======================
unlockForm();
loadRequestsFromDB();