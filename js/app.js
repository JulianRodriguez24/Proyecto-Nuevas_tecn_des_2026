// ===================== CONFIG =====================
const API = "https://app-web-php-pwa-a9b3gedsd5h8hday.mexicocentral-01.azurewebsites.net";

// ===================== ESTADO =====================
let currentUser = null;

// ===================== UTIL =====================
function $(id) {
  return document.getElementById(id);
}

// ===================== NAV SCROLL =====================
function scrollToSection(section) {
  const el = document.getElementById("section-" + section);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

// ===================== NAV =====================
function navTo(section) {
  scrollToSection(section);

  document.querySelectorAll(".nav-link").forEach(btn =>
    btn.classList.remove("active")
  );

  if (section === "home") $("nl-inicio")?.classList.add("active");
  if (section === "features") $("nl-funciones")?.classList.add("active");
  if (section === "rooms") $("nl-salas")?.classList.add("active");
}

// ===================== SCREENS =====================
function showScreen(screen) {
  ["home", "login", "main"].forEach(s => {
    $(s + "-screen")?.classList.add("hidden");
  });

  $(screen + "-screen")?.classList.remove("hidden");
}

// ===================== LOGIN =====================
async function doLogin() {
  try {
    const email = $("l-email").value;
    const password = $("l-pass").value;

    const res = await fetch(API + "/api/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const text = await res.text();
    console.log("LOGIN RAW:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      alert("Error del servidor (no JSON)");
      return;
    }

    if (!data.success) {
      alert(data.error || "Error en login");
      return;
    }

    currentUser = data.user;
    localStorage.setItem("session", JSON.stringify(currentUser));

    updateNavbar();
    renderTabs();
    showScreen("main");

  } catch (err) {
    console.error(err);
    alert("Error conectando con el servidor");
  }
}

// ===================== LOGOUT =====================
function doLogout() {
  currentUser = null;
  localStorage.removeItem("session");

  updateNavbar();
  showScreen("home");
}

// ===================== NAVBAR =====================
function updateNavbar() {
  const loginBtn = $("nav-login-btn");
  const userChip = $("nav-user-chip");

  if (currentUser) {
    loginBtn.classList.add("hidden");
    userChip.classList.remove("hidden");

    $("nav-uname").textContent = `${currentUser.name} (${currentUser.role})`;
    $("nav-avatar").textContent = currentUser.name.charAt(0).toUpperCase();

    $("nav-avatar").classList.remove("av-admin", "av-customer");
    $("nav-avatar").classList.add(
      currentUser.role === "admin" ? "av-admin" : "av-customer"
    );

  } else {
    loginBtn.classList.remove("hidden");
    userChip.classList.add("hidden");
  }
}

// ===================== TABS =====================
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

// ===================== PANEL =====================
function showPanel(p) {
  ["reservar", "misres", "admin", "usuarios"].forEach(x => {
    $("panel-" + x)?.classList.add("hidden");
  });

  $("panel-" + p)?.classList.remove("hidden");

  if (p === "misres") loadMyReservations();
  if (p === "usuarios" && currentUser.role === "admin") loadUsers();
}

// ===================== CREAR USUARIO =====================
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

    const res = await fetch(API + "/api/register.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });

    const text = await res.text();
    console.log("REGISTER RAW:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      alert("Error servidor (no JSON)");
      return;
    }

    if (data.success) {
      alert("Usuario creado correctamente");
      closeUserForm();
      loadUsers();
    } else {
      alert(data.error || "Error al crear usuario");
    }

  } catch (err) {
    console.error(err);
    alert("Error conectando con servidor");
  }
}

// ===================== LISTAR USUARIOS =====================
async function loadUsers() {
  if (!currentUser || currentUser.role !== "admin") return;

  const res = await fetch(API + "/api/getUsers.php");
  const data = await res.json();

  const tbody = $("users-tbody");
  tbody.innerHTML = "";

  data.forEach(u => {
    tbody.innerHTML += `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>-</td>
      </tr>
    `;
  });
}

// ===================== RESERVA =====================
async function submitRes() {
  try {
    const user = JSON.parse(localStorage.getItem("session"));

    const payload = {
      user_id: user.id,
      sala: "Sala 1",
      fecha: $("f-date").value,
      inicio: $("f-start").value,
      fin: $("f-end").value
    };

    const res = await fetch(API + "/api/reservas.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
      alert("Reserva creada");
      loadMyReservations();
    } else {
      alert("Error al reservar");
    }

  } catch (err) {
    console.error(err);
    alert("Error servidor");
  }
}

// ===================== MIS RESERVAS =====================
async function loadMyReservations() {
  const user = JSON.parse(localStorage.getItem("session"));

  const res = await fetch(API + `/api/reservas.php?user_id=${user.id}`);
  const data = await res.json();

  const container = $("my-res-list");
  container.innerHTML = "";

  data.forEach(r => {
    container.innerHTML += `
      <div>
        <b>${r.sala}</b> - ${r.fecha}
        (${r.hora_inicio} - ${r.hora_fin})
      </div>
    `;
  });
}

// ===================== INIT =====================
document.addEventListener("DOMContentLoaded", () => {

  // eventos nav
  $("nl-inicio")?.addEventListener("click", () => navTo("home"));
  $("nl-funciones")?.addEventListener("click", () => navTo("features"));
  $("nl-salas")?.addEventListener("click", () => navTo("rooms"));

  // restaurar sesión
  const saved = localStorage.getItem("session");
  if (saved) {
    currentUser = JSON.parse(saved);
    updateNavbar();
    renderTabs();
    showScreen("main");
  } else {
    showScreen("home");
  }
});