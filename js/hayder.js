// Firebase Login Logic for NEA Officer and Operator
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  limit
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDlDZZQtcGjbz14ovu1-Bi8Y63bhze74eI",
  authDomain: "hcms-nea-and-operator.firebaseapp.com",
  projectId: "hcms-nea-and-operator",
  storageBucket: "hcms-nea-and-operator.firebasestorage.app",
  messagingSenderId: "769961295453",
  appId: "1:769961295453:web:c2cb6090090c6a3244d7b4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function getRoleFromPage() {
  const role = document.body?.dataset?.role;
  if (role) return role;

  const t = (document.title || "").toLowerCase();
  if (t.includes("nea")) return "nea";
  if (t.includes("operator")) return "operator";
  return null;
}

async function findUserByIdentifierAndRole(identifier, role) {
  const usersRef = collection(db, "users");
  const q = query(
    usersRef,
    where("identifier", "==", identifier),
    where("role", "==", role),
    limit(1)
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

(() => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const identifierEl = document.getElementById("loginIdentifier");
  const passwordEl = document.getElementById("loginPassword");

  const identifierErr = document.getElementById("loginIdentifierErr");
  const passwordErr = document.getElementById("loginPasswordErr");
  const msgEl = document.getElementById("loginMsg");

  const role = getRoleFromPage();

  function setMsg(text, isError = false) {
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.style.color = isError ? "#b00020" : "#1b5e20";
  }

  function clearUI() {
    if (identifierErr) identifierErr.textContent = "";
    if (passwordErr) passwordErr.textContent = "";
    setMsg("");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearUI();

    const identifier = (identifierEl?.value || "").trim();
    const password = passwordEl?.value || "";

    if (!identifier) { if (identifierErr) identifierErr.textContent = "Enter email or phone."; return; }
    if (!password) { if (passwordErr) passwordErr.textContent = "Enter password."; return; }
    if (!role) { setMsg("Role not detected for this login page.", true); return; }

    setMsg("Signing in...");

    try {
      const user = await findUserByIdentifierAndRole(identifier, role);

      if (!user || user.password !== password) {
        setMsg("Invalid login details.", true);
        return;
      }

      sessionStorage.setItem("hcmsUser", JSON.stringify({
        role: user.role,
        name: user.name,
        identifier: user.identifier
      }));

      setMsg("Login successful!");

      if (role === "nea") {
        window.location.href = "../NEA Officer/overview-dashboard.html";
      } else if (role === "operator") {
        window.location.href = "../Operator/operator-dashboard.html";
      } else {
        window.location.href = "../index.html";
      }
    } catch (err) {
      console.error(err);
      setMsg("Database error. Check Firestore Rules + console.", true);
    }
  });
})();



// Sidebar
(() => {
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  if (!menuBtn || !sidebar || !overlay) return;

  const STORAGE_KEY = "neaSidebarOpen";

  function openSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("open");
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    menuBtn.setAttribute("aria-expanded", "true");
    sidebar.setAttribute("aria-hidden", "false");
    localStorage.setItem(STORAGE_KEY, "true");
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
    overlay.hidden = true;
    document.body.style.overflow = "";
    menuBtn.setAttribute("aria-expanded", "false");
    sidebar.setAttribute("aria-hidden", "true");
    localStorage.setItem(STORAGE_KEY, "false");
  }

  if (localStorage.getItem(STORAGE_KEY) === "true") {
    openSidebar();
  } else {
    closeSidebar();
  }

  menuBtn.addEventListener("click", () => {
    sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
  });

  overlay.addEventListener("click", closeSidebar);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
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
    scoreRange.dispatchEvent(new Event("input"));
    if (remarksBox) remarksBox.value = "";
  });
})();
