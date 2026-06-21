const API_BASE = "https://m-wastesystem-1.onrender.com";

let requests = [];

// ======================
// POPUP
// ======================
function popup(msg) {
  const p = document.getElementById("popup");
  if (!p) return;

  p.innerText = msg;
  p.style.display = "block";

  setTimeout(() => {
    p.style.display = "none";
  }, 2500);
}

// ======================
// LOAD REQUESTS
// ======================
async function loadRequestsFromDB() {
  try {
    const res = await fetch(`${API_BASE}/api/requests`);

    if (!res.ok) throw new Error("Failed to fetch");

    requests = await res.json();
    render();

  } catch (err) {
    console.log("LOAD ERROR:", err);
    popup("Server connection failed");
  }
}

// ======================
// RENDER TABLE
// ======================
function render() {
  const table = document.getElementById("requestTable");
  if (!table) return;

  table.innerHTML = "";

  if (!requests || requests.length === 0) {
    table.innerHTML = `<tr><td colspan="4">No requests submitted</td></tr>`;
    return;
  }

  requests.forEach(r => {
    table.innerHTML += `
      <tr>
        <td>${r.name || "-"}</td>
        <td>${r.location || "-"}</td>
        <td>${r.phone || "-"}</td>
        <td>${r.status || "Pending"}</td>
      </tr>
    `;
  });
}

// ======================
// LOGIN / REGISTER
// ======================
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const fullName = document.getElementById("userName")?.value;
    const email = document.getElementById("userEmail")?.value;
    const password = document.getElementById("userPassword")?.value;

    if (!fullName || !email || !password) {
      popup("Fill all fields");
      return;
    }

    const response = await fetch(`${API_BASE}/api/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password })
    });

    const result = await response.json();

    if (!response.ok) {
      popup(result.message || "Login failed");
      return;
    }

    // SAVE USER
    localStorage.setItem("user", JSON.stringify(result.user));

    // SWITCH UI
    unlockForm();

    popup(result.message || "Login successful");

    e.target.reset();
    loadRequestsFromDB();

  } catch (err) {
    console.log(err);
    popup("Server unavailable");
  }
});

// ======================
// REQUEST SUBMIT
// ======================
document.getElementById("wasteForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const name = document.getElementById("fullName")?.value;
    const location = document.getElementById("location")?.value;
    const phone = document.getElementById("phone")?.value;
    const email = document.getElementById("email")?.value;
    const wasteType = document.getElementById("wasteType")?.value;
    const additionalInfo = document.getElementById("additionalInfo")?.value;

    if (!name || !location || !phone || !wasteType) {
      popup("Fill required fields");
      return;
    }

    const response = await fetch(`${API_BASE}/api/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        location,
        phone,
        email,
        wasteType,
        additionalInfo
      })
    });

    const result = await response.json();

    if (!response.ok) {
      popup(result.message || "Failed");
      return;
    }

    popup("Request submitted");

    e.target.reset();
    loadRequestsFromDB();

  } catch (err) {
    console.log(err);
    popup("Server connection failed");
  }
});

// ======================
// FIXED LOGIN UI SWITCH
// ======================
function unlockForm() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  const auth = document.getElementById("auth");
  const request = document.getElementById("request");
  const loggedUser = document.getElementById("loggedUser");

  // FORCE consistent UI state
  if (auth) auth.style.display = "none";

  if (request) {
    request.classList.remove("hidden");
    request.style.display = "block";
  }

  if (loggedUser) {
    loggedUser.innerText = `Logged in as: ${user.name}`;
  }
}

// ======================
// LOGOUT
// ======================
function logout() {
  localStorage.removeItem("user");
  location.reload();
}

// ======================
// INIT
// ======================
window.addEventListener("load", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user) {
    unlockForm();
  } else {
    const auth = document.getElementById("auth");
    const request = document.getElementById("request");

    if (auth) auth.style.display = "block";
    if (request) request.classList.add("hidden");
  }

  loadRequestsFromDB();
});