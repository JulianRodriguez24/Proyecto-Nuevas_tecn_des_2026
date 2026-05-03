// ================= CONFIG =================
const API = "https://app-web-php-pwa-a9b3gedsd5h8hday.mexicocentral-01.azurewebsites.net/api/";

// ================= ESTADO =================
let currentUser = null;

// ================= UTIL =================
function $(id) {
  return document.getElementById(id);
}

// ================= SCROLL NAV =================
function scrollToSection(section) {
  const el = document.getElementById("section-" + section);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

// ================= SCREENS =================
function showScreen(screen) {
  ["home", "login", "main"].forEach(s => {
    $(s + "-screen")?.classList.add("hidden");
  });

  $(screen + "-screen")?.classList.remove("hidden");
}

// ================= NAV =================
function navTo(section) {
  scrollToSection(section);

  document.querySelectorAll(".nav-link")
    .forEach(btn => btn.classList.remove("active"));

  if (section === "home") $("nl-inicio")?.classList.add("active");
  if (section === "features") $("nl-funciones")?.classList.add("active");
  if (section === "rooms") $("nl-salas")?.classList.add("active");
}

// ================= NAVBAR =================
function updateNavbar() {
  const loginBtn = $("nav-login-btn");
  const userChip = $("nav-user-chip");
  const uname = $("nav-uname");
  const avatar = $("nav-avatar");

  if (currentUser) {
    loginBtn.classList.add("hidden");
    userChip.classList.remove("hidden");

    uname.textContent = `${currentUser.name} (${currentUser.role})`;
    avatar.textContent = currentUser.name.charAt(0).toUpperCase();

    avatar.classList.remove("av-admin", "av-customer");
    avatar.classList.add(
      currentUser.role === "admin" ? "av-admin" : "av-customer"
    );
  } else {
    loginBtn.classList.remove("hidden");
    userChip.classList.add("hidden");
  }
}

// ================= LOGIN =================
async function doLogin() {
  const email = $("l-email").value;
  const password = $("l-pass").value;

  try {
    const res = await fetch(API + "login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Respuesta no JSON:", text);
      alert("Error del servidor");
      return;
    }

    if (!data.success) {
      alert(data.message || "Credenciales incorrectas");
      return;
    }

    currentUser = data.user;
    localStorage.setItem("session", JSON.stringify(currentUser));

    updateNavbar();
    renderTabs();
    showScreen("main");

  } catch (err) {
    console.error(err);
    alert("Error de conexión");
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
function showPanel(panel) {
  ["reservar", "misres", "admin", "usuarios"].forEach(p => {
    $("panel-" + p)?.classList.add("hidden");
  });

  $("panel-" + panel)?.classList.remove("hidden");

  if (panel === "misres") loadMyReservations();
  if (panel === "usuarios") loadUsers();
}

// ================= USUARIOS =================
function openCreateUser() {
  $("user-form-wrap")?.classList.remove("hidden");
}

function closeUserForm() {
  $("user-form-wrap")?.classList.add("hidden");
}

async function saveUser() {
  const name = $("uf-name").value;
  const email = $("uf-email").value;
  const password = $("uf-pass").value;
  const role = $("uf-role").value;

  try {
    const res = await fetch(API + "register.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Respuesta no JSON:", text);
      alert("Error del servidor");
      return;
    }

    if (data.success) {
      alert("Usuario creado");
      closeUserForm();
      loadUsers();
    } else {
      alert(data.message || "Error al crear usuario");
    }

  } catch (err) {
    console.error(err);
    alert("Error de conexión");
  }
}

async function loadUsers() {
  if (!currentUser || currentUser.role !== "admin") return;

  try {
    const res = await fetch(API + "getUsers.php");
    const users = await res.json();

    const tbody = $("users-tbody");
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
  const user = JSON.parse(localStorage.getItem("session"));

  const data = {
    user_id: user.id,
    sala: "Sala 1",
    fecha: $("f-date").value,
    inicio: $("f-start").value,
    fin: $("f-end").value
  };

  try {
    const res = await fetch(API + "reservas.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const r = await res.json();

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
  const user = JSON.parse(localStorage.getItem("session"));

  try {
    const res = await fetch(API + `reservas.php?user_id=${user.id}`);
    const data = await res.json();

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

  // NAV BOTONES
  $("nl-inicio")?.addEventListener("click", () => navTo("home"));
  $("nl-funciones")?.addEventListener("click", () => navTo("features"));
  $("nl-salas")?.addEventListener("click", () => navTo("rooms"));

  // LOGIN BTN
  $("nav-login-btn")?.addEventListener("click", () => showScreen("login"));

  // SESSION
  const session = localStorage.getItem("session");

  if (session) {
    currentUser = JSON.parse(session);
    updateNavbar();
    renderTabs();
    showScreen("main");
  } else {
    showScreen("home");
  }
});