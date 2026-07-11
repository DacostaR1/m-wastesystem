
// MOBILE WASTE COLLECTION SYSTEM
// ADMIN DASHBOARD JAVASCRIPT


document.addEventListener("DOMContentLoaded", () => {
    loadRequests();
});


// LOAD ALL REQUESTS


async function loadRequests() {

    const table = document.getElementById("requestTable");

    if (!table) {
        console.error("Request table not found.");
        return;
    }

    table.innerHTML = `
        <tr>
            <td colspan="8" style="text-align:center;">
                Loading requests...
            </td>
        </tr>
    `;

    try {

        const response = await fetch("/api/requests");

        if (!response.ok) {
            throw new Error("Unable to load requests.");
        }

        const requests = await response.json();

        table.innerHTML = "";

        if (requests.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;">
                        No requests found.
                    </td>
                </tr>
            `;

            return;
        }

        requests.forEach(request => {

            table.innerHTML += `
                <tr>

                    <td>${request.id}</td>

                    <td>${request.name}</td>

                    <td>${request.phone}</td>

                    <td>${request.location}</td>

                    <td>${request.wasteType}</td>

                    <td>${request.status}</td>

                    <td>

                        <input
                            type="text"
                            id="truck-${request.id}"
                            value="${request.assigned_truck || ""}"
                            placeholder="Truck Number"
                        >

                    </td>

                    <td>

                        <button
                            onclick="updateRequest(${request.id}, 'Approved')">
                            Approve
                        </button>

                        <button
                            onclick="rejectRequest(${request.id})">
                            Reject
                        </button>

                        <button
                            onclick="assignTruck(${request.id})">
                            Assign Truck
                        </button>

                    </td>

                </tr>
            `;

        });

    }
    catch (error) {

        console.error(error);

        table.innerHTML = `
            <tr>
                <td colspan="8" style="color:red;text-align:center;">
                    Failed to load requests.
                </td>
            </tr>
        `;

    }

}


// APPROVE REQUEST


async function updateRequest(id, status) {

 const admin = JSON.parse(sessionStorage.getItem("loggedAdmin") || "{}");
const adminName = admin.username || "Administrator";

    try {

        const response = await fetch(`/api/admin/requests/${id}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                status: status,
                admin: adminName,
                remarks: "Approved by " + adminName

            })

        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Update failed.");
        }

        alert(`Request ${status}.`);

        loadRequests();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }
}


// REJECT REQUEST


async function rejectRequest(id) {

    const reason = prompt("Enter rejection reason:");

    if (reason === null) return;

    if (reason.trim() === "") {

        alert("Rejection reason is required.");

        return;

    }

    try {

        const response = await fetch(`/api/admin/requests/${id}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

body: JSON.stringify({

    status: "Rejected",
    admin: adminName,
    reason: reason.trim()

})

        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Rejection failed.");
        }

        alert("Request rejected successfully.");

        loadRequests();

    }
    catch (error) {

        console.error(error);

        alert(error.message);

    }

}

// =====================================
// ASSIGN TRUCK
// =====================================

async function assignTruck(id) {

    const input = document.getElementById(`truck-${id}`);

    if (!input) {

        alert("Truck input not found.");

        return;

    }

    const truck = input.value.trim();

    if (truck === "") {

        alert("Please enter a truck number.");

        input.focus();

        return;

    }

    try {

        const response = await fetch(`/api/admin/requests/${id}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

body: JSON.stringify({

    truck: truck,
    admin: adminName

})

        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Truck assignment failed.");
        }

        alert("Truck assigned successfully.");

        loadRequests();

    }
    catch (error) {

        console.error(error);

        alert(error.message);

    }

}