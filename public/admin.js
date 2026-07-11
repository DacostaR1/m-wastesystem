// ===============================
// ADMIN DASHBOARD JAVASCRIPT
// ===============================


// Load all requests
function loadRequests() {

    fetch("/api/admin/requests")

    .then(response => {

        if (!response.ok) {
            throw new Error("Failed to load requests");
        }

        return response.json();

    })

    .then(data => {


        const table = document.getElementById("requestTable");


        if (!table) {
            console.error("requestTable not found");
            return;
        }


        table.innerHTML = "";


        data.forEach(request => {


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
                    id="truck-${request.id}" 
                    placeholder="Truck Number">

                </td>


                <td>


                    <button 
                    onclick="updateRequest(${request.id}, 'Approved')">
                        Approve
                    </button>


                    <button 
                    onclick="updateRequest(${request.id}, 'Rejected')">
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


    })

    .catch(error => {

        console.error(
            "Loading requests failed:",
            error
        );

    });


}




// Approve / Reject request
async function updateRequest(id, status) {


    try {


        const response = await fetch(
            `/api/admin/requests/${id}`,
            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json"

                },


                body: JSON.stringify({

                    status: status

                })

            }
        );



        const result = await response.json();



        if (!response.ok) {

            throw new Error(
                result.message || "Update failed"
            );

        }



        console.log(result);



        alert(
            `Request ${status}`
        );



        loadRequests();



    }


    catch(error) {


        console.error(
            "Request update error:",
            error
        );


        alert(
            "Failed to update request"
        );


    }


}





// Assign truck
async function assignTruck(id) {


    const truckInput =
    document.getElementById(`truck-${id}`);



    if (!truckInput) {

        alert(
            "Truck input missing"
        );

        return;

    }



    const truck =
    truckInput.value.trim();




    if (!truck) {

        alert(
            "Please enter truck number"
        );

        return;

    }



    try {


        const response = await fetch(
            `/api/admin/requests/${id}`,
            {


                method:"PUT",


                headers:{

                    "Content-Type":"application/json"

                },


                body:JSON.stringify({

                    truck:truck

                })


            }
        );



        const result =
        await response.json();



        if (!response.ok) {

            throw new Error(
                result.message || "Truck assignment failed"
            );

        }



        console.log(result);



        alert(
            "Truck assigned successfully"
        );



        loadRequests();



    }


    catch(error) {


        console.error(
            "Truck assignment error:",
            error
        );


        alert(
            "Failed to assign truck"
        );


    }


}





// Automatically load when page opens
document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadRequests();

    }
);