// ================= CONFIG =================
const API = "https://app-web-php-pwa-a9b3gedsd5h8hday.mexicocentral-01.azurewebsites.net/api/";

// ================= ESTADO =================
let currentUser = null;

// ================= UTIL =================
function $(id) {
  return document.getElementById(id);
}

// ================= SCREENS =================
function showScreen(screen) {
  ["home", "login", "main"].forEach(s => {
    $(s + "-screen")?.classList.add("hidden");
  });

  $(screen + "-screen")?.classList.remove("hidden");
}

// ================= NAV SCROLL =================
function scrollToSection(section) {
  const el = $("section-" + section);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function navTo(section) {
  scrollToSection(section);

  document.querySelectorAll(".nav-link").forEach(btn =>
    btn.classList.remove("active")
  );

  if (section === "home") {
    $("nl-inicio")?.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (section === "features") {
    $("nl-funciones")?.classList.add("active");
  }

  if (section === "rooms") {
    $("nl-salas")?.classList.add("active");
  }
}

// ================= ROUTER =================
function navigate(view) {
  ["home", "login", "main"].forEach(v => {
    $(v + "-screen")?.classList.add("hidden");
  });

  $(view + "-screen")?.classList.remove("hidden");
}

// ================= NAVBAR =================
function updateNavbar() {
  const loginBtn = $("nav-login-btn");
  const userChip = $("nav-user-chip");

  if (currentUser) {
    loginBtn?.classList.add("hidden");
    userChip?.classList.remove("hidden");

    $("nav-uname").textContent = `${currentUser.name} (${currentUser.role})`;
    $("nav-avatar").textContent = currentUser.name.charAt(0).toUpperCase();

    $("nav-avatar").classList.remove("av-admin", "av-customer");
    $("nav-avatar").classList.add(
      currentUser.role === "admin" ? "av-admin" : "av-customer"
    );
  } else {
    loginBtn?.classList.remove("hidden");
    userChip?.classList.add("hidden");
  }
}

// ================= LOGIN =================
async function doLogin() {
  try {
    const email = $("l-email").value;
    const password = $("l-pass").value;

    const res = await fetch(API + "login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const text = await res.text();
    console.log("LOGIN RAW:", text);

    const data = JSON.parse(text);

    if (!data.success) {
      $("l-err").classList.remove("hidden");
      return;
    }

    currentUser = data.user;
    localStorage.setItem("session", JSON.stringify(currentUser));

    $("l-err").classList.add("hidden");

    updateNavbar();
    renderTabs();
    navigate("main");

  } catch (err) {
    console.error(err);
    alert("Error conectando con el servidor");
  }
}

// ================= LOGOUT =================
function doLogout() {
  currentUser = null;
  localStorage.removeItem("session");

  updateNavbar();
  showScreen("home");
}

// ================= TABS =================
function renderTabs() {
  const tabs = $("tabs-bar");
  tabs.innerHTML = "";

  let list = [
    { id: "reservar", label: "Reservar" },
    { id: "misres", label: "Mis reservas" }
  ];

  if (currentUser.role === "admin") {
    list.push({ id: "admin", label: "Admin" });
    list.push({ id: "usuarios", label: "Usuarios" });
  }

  list.forEach(t => {
    const btn = document.createElement("button");
    btn.textContent = t.label;
    btn.className = "nav-link";

    btn.addEventListener("click", () => showPanel(t.id));

    tabs.appendChild(btn);
  });

  showPanel("reservar");
}

// ================= PANEL =================
function showPanel(p) {
  ["reservar", "misres", "admin", "usuarios"].forEach(x => {
    $("panel-" + x)?.classList.add("hidden");
  });

  $("panel-" + p)?.classList.remove("hidden");

  if (p === "misres") loadMyReservations();
  if (p === "usuarios" && currentUser.role === "admin") loadUsers();
}

// ================= USUARIOS =================
function openCreateUser() {
  $("user-form-wrap")?.classList.remove("hidden");
}

function closeUserForm() {
  $("user-form-wrap")?.classList.add("hidden");
}

async function saveUser() {
  try {
    const name = $("uf-name").value;
    const email = $("uf-email").value;
    const password = $("uf-pass").value;
    const role = $("uf-role").value;

    const res = await fetch(API + "register.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });

    const text = await res.text();
    console.log("REGISTER RAW:", text);

    const data = JSON.parse(text);

    if (data.success) {
      alert("Usuario creado");
      loadUsers();
      closeUserForm();
    } else {
      alert(data.message || "Error al crear usuario");
    }

  } catch (err) {
    console.error(err);
    alert("Error del servidor");
  }
}

async function loadUsers() {
  if (currentUser.role !== "admin") return;

  try {
    const res = await fetch(API + "getUsers.php");
    const text = await res.text();
    console.log("USERS RAW:", text);

    const users = JSON.parse(text);

    const tbody = $("users-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    users.forEach(u => {
      tbody.innerHTML += `
        <tr>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td>-</td>
        </tr>
      `;
    });

  } catch (err) {
    console.error(err);
  }
}

// ================= RESERVAS =================
async function submitRes() {
  try {
    const user = JSON.parse(localStorage.getItem("session"));

    const data = {
      user_id: user.id,
      sala: "Sala 1",
      fecha: $("f-date").value,
      inicio: $("f-start").value,
      fin: $("f-end").value
    };

    const res = await fetch(API + "reservas.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const text = await res.text();
    console.log("RESERVA RAW:", text);

    const r = JSON.parse(text);

    if (r.success) {
      alert("Reserva creada");
      loadMyReservations();
    } else {
      alert("Error al reservar");
    }

  } catch (err) {
    console.error(err);
  }
}

async function loadMyReservations() {
  try {
    const user = JSON.parse(localStorage.getItem("session"));

    const res = await fetch(API + `reservas.php?user_id=${user.id}`);
    const text = await res.text();
    console.log("MIS RESERVAS:", text);

    const data = JSON.parse(text);

    const container = $("my-res-list");
    container.innerHTML = "";

    data.forEach(r => {
      container.innerHTML += `
        <div>
          <b>${r.sala}</b> - ${r.fecha} (${r.hora_inicio} - ${r.hora_fin})
        </div>
      `;
    });

  } catch (err) {
    console.error(err);
  }
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  const session = localStorage.getItem("session");

  if (session) {
    currentUser = JSON.parse(session);
    updateNavbar();
    renderTabs();
    navigate("main");
  } else {
    showScreen("home");
  }
});