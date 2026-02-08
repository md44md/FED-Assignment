// Firebase Login Logic for NEA Officer and Operator
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  limit,
  addDoc,
  serverTimestamp,
  orderBy,
  onSnapshot
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

function fmtDate(ts) {
  const dt = ts?.toDate ? ts.toDate() : null;
  if (!dt) return "-";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0,0,0,0);
  return d;
}

function startOfWeekMonday() {
  const d = startOfToday();
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function setupPagination(container, totalItems, pageSize, onPageChange) {
  if (!container) return;

  const maxPages = 3;
  const pageCount = Math.min(maxPages, Math.max(1, Math.ceil(totalItems / pageSize)));

  container.innerHTML = "";
  for (let i = 1; i <= pageCount; i++) {
    const a = document.createElement("a");
    a.href = "#";
    a.className = "page-btn" + (i === 1 ? " active" : "");
    a.textContent = String(i);
    a.addEventListener("click", (e) => {
      e.preventDefault();
      [...container.querySelectorAll(".page-btn")].forEach(x => x.classList.remove("active"));
      a.classList.add("active");
      onPageChange(i);
    });
    container.appendChild(a);
  }

  onPageChange(1);
}


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

// Overview Dashboard Recent Inspections Table
(() => {
  const tbody = document.getElementById("recentInspectionsBody");
  const pager = document.querySelector(".pagination");
  const kpiTotal = document.getElementById("kpiTotalInspections");
  const kpiReinspect = document.getElementById("kpiReinspect");
  const kpiDue = document.getElementById("kpiDueThisWeek");

  if (!tbody) return;

  const pageSize = 6;
  const maxDocs = pageSize * 3;

  let rows = [];

  function renderPage(page) {
    const start = (page - 1) * pageSize;
    const slice = rows.slice(start, start + pageSize);

    tbody.innerHTML = "";
    if (slice.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="padding:14px;color:#666;">No inspections yet.</td></tr>`;
      return;
    }

    slice.forEach(x => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${x.stallName || "-"}</td>
        <td class="centre">${x.grade || "-"}</td>
        <td class="right">${fmtDate(x.createdAt)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function updateKPIs() {
    if (kpiTotal) kpiTotal.textContent = String(rows.length);

    const reinspectCount = rows.filter(r => (r.grade === "D") || (typeof r.score === "number" && r.score < 50)).length;
    if (kpiReinspect) kpiReinspect.textContent = String(reinspectCount);

    const monday = startOfWeekMonday();
    const dueThisWeek = rows.filter(r => {
      const dt = r.createdAt?.toDate ? r.createdAt.toDate() : null;
      return dt && dt >= monday;
    }).length;
    if (kpiDue) kpiDue.textContent = String(dueThisWeek);
  }

  const qy = query(collection(db, "inspections"), orderBy("createdAt", "desc"), limit(maxDocs));

  onSnapshot(qy, (snap) => {
    rows = snap.docs.map(d => d.data());

    setupPagination(pager, rows.length, pageSize, renderPage);
    updateKPIs();
  }, (err) => {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="3" style="padding:14px;color:#b00020;">Failed to load data.</td></tr>`;
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

// NEA Inspection Submission
(() => {
  const submitBtn = document.getElementById("submitInspectionBtn");
  const stallSelect = document.getElementById("stallSelect");
  const scoreRange = document.getElementById("scoreRange");
  const remarksBox = document.getElementById("remarks");
  const gradeLetter = document.getElementById("gradeLetter");

  if (!submitBtn || !stallSelect || !scoreRange || !gradeLetter) return;

  function getSessionUser() {
    try { return JSON.parse(sessionStorage.getItem("hcmsUser") || "null"); }
    catch { return null; }
  }

  submitBtn.addEventListener("click", async () => {
    if (!stallSelect.value) {
      alert("Please select a stall before submitting.");
      return;
    }

    const score = Number(scoreRange.value);
    const grade = gradeLetter.textContent.trim();
    const remarks = (remarksBox?.value || "").trim();

    const user = getSessionUser();

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
      await addDoc(collection(db, "inspections"), {
        stallName: stallSelect.value,
        score,
        grade,
        remarks,
        createdAt: serverTimestamp(),
        createdBy: user ? {
          role: user.role,
          name: user.name,
          identifier: user.identifier
        } : null
      });

      alert("Inspection submitted successfully!");

      // reset UI
      stallSelect.selectedIndex = 0;
      scoreRange.value = 0;
      scoreRange.dispatchEvent(new Event("input"));
      if (remarksBox) remarksBox.value = "";

    } catch (err) {
      console.error(err);
      alert("Submit failed. Check Firestore Rules + console.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Inspection";
    }
  });
})();


// Inspection Dashboard Recent Inspections Table
(() => {
  const tbody = document.getElementById("inspectionRecentBody");
  const pager = document.querySelector(".pagination");

  if (!tbody) return;

  const pageSize = 6;
  const maxDocs = pageSize * 3;
  let rows = [];

  function renderPage(page) {
    const start = (page - 1) * pageSize;
    const slice = rows.slice(start, start + pageSize);

    tbody.innerHTML = "";
    if (slice.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="padding:14px;color:#666;">No inspections yet.</td></tr>`;
      return;
    }

    slice.forEach(x => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${x.stallName || "-"}</td>
        <td class="centre">${x.grade || "-"}</td>
        <td class="right">${fmtDate(x.createdAt)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  const qy = query(collection(db, "inspections"), orderBy("createdAt", "desc"), limit(maxDocs));

  onSnapshot(qy, (snap) => {
    rows = snap.docs.map(d => d.data());
    setupPagination(pager, rows.length, pageSize, renderPage);
  }, (err) => {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="3" style="padding:14px;color:#b00020;">Failed to load data.</td></tr>`;
  });
})();


// Hygiene Grade History Page
(() => {
  const stallFilter = document.getElementById("stallFilter");
  const gradeFilter = document.getElementById("gradeFilter");
  const dateFilter = document.getElementById("dateFilter");
  const tbody = document.getElementById("historyTbody");

  if (!stallFilter || !gradeFilter || !dateFilter || !tbody) return;

  let allRows = [];

  function fmtDate(ts) {
    const dt = ts?.toDate ? ts.toDate() : null;
    if (!dt) return "-";
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yyyy = dt.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  function withinRange(ts) {
    const mode = dateFilter.value;
    if (mode === "all") return true;
    const days = Number(mode);
    if (!days) return true;

    const dt = ts?.toDate ? ts.toDate() : null;
    if (!dt) return false;

    const now = new Date();
    const diffMs = now - dt;
    return diffMs >= 0 && diffMs <= days * 24 * 60 * 60 * 1000;
  }

  function render() {
  const pager = document.querySelector(".pagination");
  const stall = stallFilter.value;
  const grade = gradeFilter.value;

  const filtered = allRows
    .filter(r => (stall ? r.stallName === stall : true))
    .filter(r => (grade ? r.grade === grade : true))
    .filter(r => withinRange(r.createdAt));

  const pageSize = 8;

  function renderPage(page) {
    const start = (page - 1) * pageSize;
    const slice = filtered.slice(start, start + pageSize);

    tbody.innerHTML = "";
    if (slice.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="padding:14px;color:#666;">No records found.</td></tr>`;
      return;
    }

    slice.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.stallName || "-"}</td>
        <td class="centre">${r.score ?? "-"}</td>
        <td class="centre"><span class="grade-badge grade-${String(r.grade||"").toLowerCase()}">${r.grade || "-"}</span></td>
        <td class="right">${fmtDate(r.createdAt)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  setupPagination(pager, filtered.length, pageSize, renderPage);
  }

  async function init() {
    try {
      const qy = query(
        collection(db, "inspections"),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const snap = await getDocs(qy);
      allRows = snap.docs.map(d => d.data());

      const stalls = [...new Set(allRows.map(x => x.stallName).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
      stalls.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        stallFilter.appendChild(opt);
      });

      render();
    } catch (err) {
      console.error(err);
      tbody.innerHTML = `<tr><td colspan="4" style="padding:14px;color:#b00020;">Failed to load data.</td></tr>`;
    }
  }

  [stallFilter, gradeFilter, dateFilter].forEach(el => el.addEventListener("change", render));

  init();
})();


// Sign Out Button
(() => {
  const btn = document.getElementById("logOutBtn");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    e.preventDefault();

    sessionStorage.removeItem("hcmsUser");

    localStorage.removeItem("neaSidebarOpen");

    window.location.href = "../index.html";
  });
})();
