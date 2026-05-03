// ================== CONFIG ==================
const API = "https://app-web-php-pwa-a9b3gedsd5h8hday.mexicocentral-01.azurewebsites.net/api/";

// ================== ESTADO ==================
let currentUser = null;

// ================== UTIL ==================
function $(id){
  return document.getElementById(id);
}

// ================== SCROLL NAV ==================
function scrollToSection(section){
  const el = document.getElementById("section-" + section);
  if(el) el.scrollIntoView({ behavior:"smooth" });
}

// ================== SCREENS ==================
function showScreen(screen){
  ["home","login","main"].forEach(s=>{
    $(s+"-screen")?.classList.add("hidden");
  });

  $(screen+"-screen")?.classList.remove("hidden");
}

// ================== NAV ==================
function navTo(section){

  scrollToSection(section);

  document.querySelectorAll(".nav-link").forEach(b=>b.classList.remove("active"));

  if(section==="home"){
    $("nl-inicio")?.classList.add("active");
    window.scrollTo({top:0,behavior:"smooth"});
  }

  if(section==="features"){
    $("nl-funciones")?.classList.add("active");
  }

  if(section==="rooms"){
    $("nl-salas")?.classList.add("active");
  }
}

// ================== LOGIN ==================
async function doLogin(){

  const email = $("l-email").value;
  const password = $("l-pass").value;

  try{

    const res = await fetch(API + "login.php",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({email,password})
    });

    const data = await res.json();
    console.log("LOGIN:", data);

    if(!data.success){
      alert(data.error || "Error login");
      return;
    }

    currentUser = data.user;

    // 🔥 guardar sesión
    localStorage.setItem("session", JSON.stringify(currentUser));

    updateNavbar();
    renderTabs();
    showScreen("main");

  }catch(err){
    console.error(err);
    alert("Error de conexión");
  }
}

// ================== LOGOUT ==================
function doLogout(){
  currentUser = null;
  localStorage.removeItem("session");

  updateNavbar();
  showScreen("home");
}

// ================== NAVBAR ==================
function updateNavbar(){

  const loginBtn = $("nav-login-btn");
  const userChip = $("nav-user-chip");
  const uname = $("nav-uname");
  const avatar = $("nav-avatar");

  if(currentUser){

    loginBtn?.classList.add("hidden");
    userChip?.classList.remove("hidden");

    uname.textContent = `${currentUser.name} (${currentUser.role})`;

    avatar.textContent = currentUser.name.charAt(0).toUpperCase();

    avatar.classList.remove("av-admin","av-customer");
    avatar.classList.add(
      currentUser.role === "admin" ? "av-admin" : "av-customer"
    );

  }else{
    loginBtn?.classList.remove("hidden");
    userChip?.classList.add("hidden");
  }
}

// ================== TABS ==================
function renderTabs(){

  const tabs = $("tabs-bar");
  if(!tabs) return;

  tabs.innerHTML="";

  let list = [
    {id:"reservar",label:"Reservar"},
    {id:"misres",label:"Mis reservas"}
  ];

  if(currentUser?.role === "admin"){
    list.push({id:"admin",label:"Admin"});
    list.push({id:"usuarios",label:"Usuarios"});
  }

  list.forEach(t=>{
    const btn = document.createElement("button");
    btn.textContent = t.label;
    btn.className = "nav-link";

    btn.addEventListener("click",()=>showPanel(t.id));

    tabs.appendChild(btn);
  });

  showPanel("reservar");
}

// ================== PANELES ==================
function showPanel(p){

  ["reservar","misres","admin","usuarios"].forEach(x=>{
    $("panel-"+x)?.classList.add("hidden");
  });

  $("panel-"+p)?.classList.remove("hidden");

  if(p==="misres") loadMyReservations();

  if(p==="usuarios") loadUsers();
}

// ================== USUARIOS ==================
function openCreateUser(){
  $("user-form-wrap")?.classList.remove("hidden");
}

function closeUserForm(){
  $("user-form-wrap")?.classList.add("hidden");
}

async function saveUser(){

  const name = $("uf-name").value;
  const email = $("uf-email").value;
  const password = $("uf-pass").value;
  const role = $("uf-role").value;

  const res = await fetch(API + "register.php",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({name,email,password,role})
  });

  const data = await res.json();

  if(data.success){
    alert("Usuario creado");
    closeUserForm();
    loadUsers();
  }else{
    alert(data.error || "Error al crear usuario");
  }
}

async function loadUsers(){

  if(!currentUser || currentUser.role !== "admin") return;

  const res = await fetch(API + "getUsers.php");
  const users = await res.json();

  const tbody = $("users-tbody");
  if(!tbody) return;

  tbody.innerHTML="";

  users.forEach(u=>{
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

// ================== RESERVAS ==================
async function submitRes(){

  if(!currentUser) return alert("Debes iniciar sesión");

  const data = {
    user_id: currentUser.id,
    sala: "Sala 1",
    fecha: $("f-date").value,
    inicio: $("f-start").value,
    fin: $("f-end").value
  };

  const res = await fetch(API + "reservas.php",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify(data)
  });

  const r = await res.json();

  if(r.success){
    alert("Reserva creada");
    loadMyReservations();
  }else{
    alert("Error al reservar");
  }
}

async function loadMyReservations(){

  if(!currentUser) return;

  const res = await fetch(API + `reservas.php?user_id=${currentUser.id}`);
  const data = await res.json();

  const container = $("my-res-list");
  if(!container) return;

  container.innerHTML="";

  data.forEach(r=>{
    container.innerHTML += `
      <div>
        <b>${r.sala}</b> - ${r.fecha} (${r.hora_inicio} - ${r.hora_fin})
      </div>
    `;
  });
}

// ================== INIT ==================
document.addEventListener("DOMContentLoaded",()=>{

  // NAV botones
  $("nl-inicio")?.addEventListener("click",()=>navTo("home"));
  $("nl-funciones")?.addEventListener("click",()=>navTo("features"));
  $("nl-salas")?.addEventListener("click",()=>navTo("rooms"));

  // sesión persistente
  const session = localStorage.getItem("session");

  if(session){
    currentUser = JSON.parse(session);
    updateNavbar();
    renderTabs();
    showScreen("main");
  }else{
    showScreen("home");
  }

});