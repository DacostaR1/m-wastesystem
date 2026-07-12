// ===============================
// MOBILE WASTE COLLECTION SYSTEM
// ADMIN DASHBOARD
// ===============================

const grid = document.getElementById("grid");
const stats = document.getElementById("stats");

let currentRequestId = null;

// ===============================
// INITIALIZE
// ===============================
document.addEventListener("DOMContentLoaded", () => {

    const user = JSON.parse(sessionStorage.getItem("loggedUser") || "{}");

    document.getElementById("adminWelcome").innerHTML =
        `Welcome, <strong>${user.full_name || "Administrator"}</strong>`;

    loadStats();
    loadRequests();

    // Hamburger Menu
    document.getElementById("menuBtn").onclick = openMenu;
});


// ===============================
// LOAD STATS
// ===============================
async function loadStats() {

    const res = await fetch("/api/requests");
    const data = await res.json();

    const pending = data.filter(r => (r.status || "").toLowerCase() === "pending").length;
    const approved = data.filter(r => (r.status || "").toLowerCase() === "approved").length;
    const rejected = data.filter(r => (r.status || "").toLowerCase() === "rejected").length;
    const assigned = data.filter(r => (r.status || "").toLowerCase() === "assigned").length;

    stats.innerHTML = `
        <div class="box">Pending<br><br>${pending}</div>
        <div class="box">Approved<br><br>${approved}</div>
        <div class="box">Rejected<br><br>${rejected}</div>
        <div class="box">Assigned<br><br>${assigned}</div>
    `;
}


// ===============================
// LOAD REQUESTS
// ===============================
async function loadRequests() {

    const res = await fetch("/api/requests");
    const data = await res.json();

    grid.innerHTML = "";

    if (data.length === 0) {
        grid.innerHTML = "<h3>No requests found.</h3>";
        return;
    }

    data.forEach(r => {

        const status = (r.status || "Pending").toLowerCase();

        const badge =
            status === "approved" ? "approved" :
            status === "rejected" ? "rejected" :
            status === "assigned" ? "assigned" :
            "pending";

        grid.innerHTML += `
        <div class="card">

            <p><b>Name:</b> ${r.name}</p>
            <p><b>Location:</b> ${r.location}</p>
            <p><b>Phone:</b> ${r.phone}</p>
            <p><b>Email:</b> ${r.email}</p>
            <p><b>Waste:</b> ${r.wasteType}</p>

            <p>
                <span class="status ${badge}">
                    ${r.status}
                </span>
            </p>

            <p><b>Truck:</b> ${r.assigned_truck || "-"}</p>

            <p><b>Collector:</b> ${r.assigned_collector || "-"}</p>

            <div class="actions">

                <button class="approve"
                    onclick="approveRequest(${r.id})">
                    Approve
                </button>

                <button class="reject"
                    onclick="rejectRequest(${r.id})">
                    Reject
                </button>

                <button class="assign"
                    onclick="assignTruck(${r.id})">
                    Assign
                </button>

            </div>

        </div>
        `;
    });
}


// ===============================
// APPROVE
// ===============================
async function approveRequest(id){

    await fetch(`/api/admin/requests/${id}`,{
        method:"PUT",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            status:"Approved"
        })
    });

    loadStats();
    loadRequests();
}


// ===============================
// REJECT
// ===============================
async function rejectRequest(id){

    const reason = prompt("Reason for rejection");

    if(!reason) return;

    await fetch(`/api/admin/requests/${id}`,{

        method:"PUT",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            status:"Rejected",
            reason
        })

    });

    loadStats();
    loadRequests();

}


// ===============================
// ASSIGN
// ===============================
async function assignTruck(id){

    currentRequestId = id;

    const res = await fetch("/api/collectors");
    const collectors = await res.json();

    const select = document.getElementById("collectorSelect");

    select.innerHTML = "";

    collectors.forEach(c=>{

        select.innerHTML +=
        `<option value="${c.id}">
            ${c.full_name}
        </option>`;

    });

    document.getElementById("assignModal").style.display="block";

}


// ===============================
// SAVE ASSIGNMENT
// ===============================
async function saveAssignment(){

    const truck =
        document.getElementById("truckInput").value;

    const collector =
        document.getElementById("collectorSelect").value;

    await fetch(`/api/admin/requests/${currentRequestId}`,{

        method:"PUT",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            status:"Assigned",
            truck,
            assigned_collector:collector

        })

    });

    closeAssignModal();

    loadStats();

    loadRequests();

}


// ===============================
function closeAssignModal(){

    document.getElementById("assignModal").style.display="none";

}


// ===============================
// HAMBURGER
// ===============================
function openMenu(){

    document.getElementById("sidebar").classList.add("active");
    document.getElementById("overlay").classList.add("active");

}

function closeMenu(){

    document.getElementById("sidebar").classList.remove("active");
    document.getElementById("overlay").classList.remove("active");

}

function logout(){

    if(confirm("Logout?")){

        sessionStorage.clear();

        location.href="Admin-Login.html";

    }

}