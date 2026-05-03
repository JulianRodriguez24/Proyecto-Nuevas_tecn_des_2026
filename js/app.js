const API = "https://app-web-php-pwa-a9b3gedsd5h8hday.mexicocentral-01.azurewebsites.net/api/";
// ====== ESTADO ======
let currentUser = null;

// ====== UTIL ======
function $(id) {
  return document.getElementById(id);
}

// ====== SCREENS ======
function showScreen(screen) {
  $("home-screen").classList.add("hidden");
  $("login-screen").classList.add("hidden");
  $("main-screen").classList.add("hidden");

  if (screen === "home") $("home-screen").classList.remove("hidden");
  if (screen === "login") $("login-screen").classList.remove("hidden");
  if (screen === "main") $("main-screen").classList.remove("hidden");
}

// ====== NAV ======
function navTo(section) {
  document.querySelectorAll(".nav-link").forEach(btn => btn.classList.remove("active"));

  if (section === "home") {
    $("nl-inicio").classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (section === "features") {
    $("nl-funciones").classList.add("active");
    document.getElementById("section-features").scrollIntoView({ behavior: "smooth" });
  }

  if (section === "rooms") {
    $("nl-salas").classList.add("active");
    document.getElementById("section-rooms").scrollIntoView({ behavior: "smooth" });
  }
}
// ====== ROUTER ======
function navigate(view) {
  const screens = ["home", "login", "main"];

  screens.forEach(s => {
    const el = document.getElementById(s + "-screen");
    if (el) el.classList.add("hidden");
  });

  const active = document.getElementById(view + "-screen");
  if (active) active.classList.remove("hidden");
}
// ====== LOGIN ======
async function doLogin(){

  const email = document.getElementById("l-email").value;
  const password = document.getElementById("l-pass").value;

  const res = await fetch(API + "login.php", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({email,password})
  });

  const data = await res.json();

  console.log(data);

  if(!data.success){
    alert("Error login");
    return;
  }

  currentUser = data.user;

  updateNavbar();
  renderTabs();
  navigate("main");
}
// ====== LOGOUT ======
function doLogout() {
  currentUser = null;
  updateNavbar();
  showScreen("home");
}

// ====== NAVBAR ======
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

    
    avatar.classList.remove("av-admin","av-customer");
    avatar.classList.add(
      currentUser.role === "admin" ? "av-admin" : "av-customer"
    );

  } else {
    loginBtn.classList.remove("hidden");
    userChip.classList.add("hidden");
  }
}
// ====== Usuarios ======
function openCreateUser() {
  document.getElementById("user-form-wrap")?.classList.remove("hidden");
}

function closeUserForm() {
  document.getElementById("user-form-wrap")?.classList.add("hidden");
}
async function saveUser() {
  const name = document.getElementById("uf-name").value;
  const email = document.getElementById("uf-email").value;
  const password = document.getElementById("uf-pass").value;
  const role = document.getElementById("uf-role").value;

  const res = await fetch("api/register.php", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ name, email, password, role })
  });

  const data = await res.json();

  if (data.success) {
    alert("Usuario creado");
    loadUsers();
  } else {
    alert("Error al crear usuario");
  }
}
async function loadUsers() {
   if(currentUser.role !== "admin") return;
  const res = await fetch("api/getUsers.php");
  const users = await res.json();

  const tbody = document.getElementById("users-tbody");

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
}
// ====== RESERVA ======
async function submitRes() {

  const user = JSON.parse(localStorage.getItem("session"));

  const data = {
    user_id: user.id,
    sala: "Sala 1",
    fecha: document.getElementById("f-date").value,
    inicio: document.getElementById("f-start").value,
    fin: document.getElementById("f-end").value
  };

  const res = await fetch("api/reservas.php", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(data)
  });

  const r = await res.json();

  if (r.success) {
    alert("Reserva creada");
    loadMyReservations();
  } else {
    alert("Error al reservar");
  }
}
async function loadMyReservations() {

  const user = JSON.parse(localStorage.getItem("session"));

  const res = await fetch(`api/reservas.php?user_id=${user.id}`);
  const data = await res.json();

  const container = document.getElementById("my-res-list");
  container.innerHTML = "";

  data.forEach(r => {
    container.innerHTML += `
      <div>
        <b>${r.sala}</b> - ${r.fecha} (${r.hora_inicio} - ${r.hora_fin})
      </div>
    `;
  });
}
// ====== Paneles ======
function showPanel(p) {

  ["reservar","misres","admin","usuarios"].forEach(x=>{
    $("panel-"+x)?.classList.add("hidden");
  });

  $("panel-"+p)?.classList.remove("hidden");

  if (p === "misres") loadMyReservations();

  if (p === "usuarios" && currentUser.role === "admin") {
    loadUsers();
  }
}

// ====== TOAST ======
function showToast(msg) {
  const toast = $("toast");
  toast.textContent = msg;
  toast.style.opacity = "1";

  setTimeout(() => {
    toast.style.opacity = "0";
  }, 2500);
}
function renderTabs() {
  const tabs = $("tabs-bar");
  tabs.innerHTML = "";

  let list = [
    {id:"reservar", label:"Reservar"},
    {id:"misres", label:"Mis reservas"}
  ];


  if (currentUser.role === "admin") {
    list.push({id:"admin", label:"Admin"});
    list.push({id:"usuarios", label:"Usuarios"});
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
// ====== INIT ======
document.addEventListener("DOMContentLoaded", () => {
  showScreen("home");
  updateNavbar();
});