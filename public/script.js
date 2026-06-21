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

    if (!res.ok) throw new Error("Failed to fetch requests");

    requests = await res.json();
    render();
  } catch (err) {
    console.log("LOAD ERROR:", err);
    popup("Failed to load requests");
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

  requests.forEach((r) => {
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
// ======================
function unlockForm() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  const requestSection = document.getElementById("request");
  if (requestSection) requestSection.classList.remove("hidden");

  const authSection = document.getElementById("auth");
  if (authSection) authSection.style.display = "none";

  const logged = document.getElementById("loggedUser");
  if (logged) {
    logged.innerHTML = `Logged in as: ${user.name}`;
  }
}

// ======================
// LOGIN / REGISTER
// ======================
document
  .getElementById("loginForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const userName = document.getElementById("userName")?.value;
      const userEmail = document.getElementById("userEmail")?.value;
      const userPassword = document.getElementById("userPassword")?.value;

      // FIX: prevent null value crash
      if (!userName || !userEmail || !userPassword) {
        popup("Please fill all fields");
        return;
      }

      const response = await fetch(`${API_BASE}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: userName,
          email: userEmail,
          password: userPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        popup(result.message || "Login failed");
        return;
      }

      localStorage.setItem("user", JSON.stringify(result.user));

      unlockForm();

      popup(
        result.message === "Account created"
          ? "Account created & logged in"
          : "Login successful"
      );

      e.target.reset();
      loadRequestsFromDB();
    } catch (err) {
      console.log("LOGIN ERROR:", err);
      popup("Server unavailable");
    }
  });

// ======================
// SUBMIT REQUEST
// ======================
document
  .getElementById("wasteForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const name = document.getElementById("fullName")?.value;
      const location = document.getElementById("location")?.value;
      const phone = document.getElementById("phone")?.value;
      const email = document.getElementById("email")?.value;
      const wasteType = document.getElementById("wasteType")?.value;
      const additionalInfo = document.getElementById("additionalInfo")?.value;

      if (!name || !location || !phone || !wasteType) {
        popup("Please fill required fields");
        return;
      }

      const data = {
        name,
        location,
        phone,
        email,
        wasteType,
        additionalInfo,
      };

      const response = await fetch(`${API_BASE}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        popup(result.message || "Failed to submit");
        return;
      }

      popup("Request submitted successfully");

      e.target.reset();
      loadRequestsFromDB();
    } catch (err) {
      console.log("REQUEST ERROR:", err);
      popup("Server connection failed");
    }
  });

// ======================
// INIT
// ======================
window.addEventListener("load", () => {
  unlockForm();
  loadRequestsFromDB();
});