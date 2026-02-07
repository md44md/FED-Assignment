// Sidebar
(() => {
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  if (!menuBtn || !sidebar || !overlay) return;

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
    sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
  });

  overlay.addEventListener("click", closeSidebar);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });

  document.querySelectorAll(".sidebar-link").forEach((link) => {
    link.addEventListener("click", closeSidebar);
  });
})();

// Inspection Dashboard
(() => {
  const scoreRange = document.getElementById("scoreRange");
  const scoreValue = document.getElementById("scoreValue");
  const gradeLetter = document.getElementById("gradeLetter");
  const gradeCard = document.getElementById("gradeCard");

  if (!scoreRange || !scoreValue || !gradeLetter || !gradeCard) return;

  function scoreToGrade(score) {
    if (score >= 85) return "A";
    if (score >= 70) return "B";
    if (score >= 50) return "C";
    return "D";
  }

  function updateUI(score) {
    const grade = scoreToGrade(score);
    scoreValue.textContent = score;
    gradeLetter.textContent = grade;
    gradeCard.classList.remove("is-a", "is-b", "is-c", "is-d");
    gradeCard.classList.add(`is-${grade.toLowerCase()}`);
  }

  updateUI(Number(scoreRange.value));

  scoreRange.addEventListener("input", () => {
    updateUI(Number(scoreRange.value));
  });
})();

// Inspection Submission (demo only)
(() => {
  const submitBtn = document.getElementById("submitInspectionBtn");
  const stallSelect = document.getElementById("stallSelect");
  const scoreRange = document.getElementById("scoreRange");
  const remarksBox = document.getElementById("remarks");

  if (!submitBtn) return;

  submitBtn.addEventListener("click", () => {
    if (!stallSelect.value) {
      alert("Please select a stall before submitting.");
      return;
    }

    alert(
      "Inspection submitted successfully!\n\n" +
      `Stall: ${stallSelect.value}\n` +
      `Score: ${scoreRange.value}`
    );

    stallSelect.selectedIndex = 0;
    scoreRange.value = 0;
    if (remarksBox) remarksBox.value = "";
  });
})();
