const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebarOverlay");

function openSidebar() {
  sidebar.classList.add("open");
  overlay.classList.add("open");
  overlay.hidden = false;

  document.body.style.overflow = "hidden";

  menuBtn.setAttribute("aria-expanded", "true");
  sidebar.setAttribute("aria-hidden", "false");
}

function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("open");
  overlay.hidden = true;

  document.body.style.overflow = "";

  menuBtn.setAttribute("aria-expanded", "false");
  sidebar.setAttribute("aria-hidden", "true");
}

menuBtn.addEventListener("click", () => {
  const isOpen = sidebar.classList.contains("open");
  if (isOpen) closeSidebar();
  else openSidebar();
});

overlay.addEventListener("click", closeSidebar);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSidebar();
});

document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', closeSidebar);
  });

const scoreRange = document.getElementById("scoreRange");
const scoreValue = document.getElementById("scoreValue");

function updateScoreUI(val){
  scoreValue.textContent = val;
}

scoreRange.addEventListener("input", () => {
  updateScoreUI(scoreRange.value);
});

updateScoreUI(scoreRange.value);
