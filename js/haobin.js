(function () {
  // helpers
  const $ = (id) => document.getElementById(id);

  function setText(id, msg) {
    const el = $(id);
    if (el) el.textContent = msg || "";
  }

  function setMsg(id, msg, ok = true) {
    const el = $(id);
    if (!el) return;
    el.textContent = msg || "";
    el.style.color = ok ? "green" : "crimson";
  }

  // input cleanup (email is case-insensitive, phone removes spaces)
  function normEmail(v) {
    return String(v || "").trim().toLowerCase();
  }

  function normPhone(v) {
    return String(v || "").replace(/\s+/g, "").trim();
  }

  // prevent runtime errors if firebase scripts are missing
  if (!window.firebase) {
    window.Auth = {
      initCustomerRegister() {},
      initCustomerLogin() {}
    };
    return;
  }

  // firebase services
  const auth = firebase.auth();
  const db = firebase.database();

  // store session info locally (also used by cart code via tempUserId)
  function setSession(uid, profile) {
    localStorage.setItem("tempUserId", uid);
    localStorage.setItem("hcms_currentCustomer", JSON.stringify({ uid, ...profile }));
  }

  // register: validate -> check phoneIndex -> create auth user -> save profile -> save phoneIndex
  async function registerCustomer(e) {
    e.preventDefault();

    setText("regNameErr", "");
    setText("regEmailErr", "");
    setText("regPhoneErr", "");
    setText("regPasswordErr", "");
    setMsg("regMsg", "");

    const name = String($("regName")?.value || "").trim();
    const email = normEmail($("regEmail")?.value);
    const phone = normPhone($("regPhone")?.value);
    const password = String($("regPassword")?.value || "");

    if (!name) { setText("regNameErr", "Please enter your name."); return; }
    if (!email || !email.includes("@")) { setText("regEmailErr", "Please enter a valid email address."); return; }
    if (!phone) { setText("regPhoneErr", "Please enter your phone number."); return; }
    if (password.length < 8) { setText("regPasswordErr", "Password must be at least 8 characters."); return; }

    try {
      // prevent duplicate phone registration
      const phoneSnap = await db.ref(`phoneIndex/${phone}`).get();
      if (phoneSnap.exists()) {
        setText("regPhoneErr", "This phone number is already registered.");
        return;
      }

      // create account in Firebase Auth
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      const uid = cred.user.uid;

      // user profile stored in Realtime Database (no password stored here)
      const profile = {
        name,
        email,
        phone,
        role: "customer",
        createdAt: new Date().toISOString()
      };

      await db.ref(`users/${uid}`).set(profile);

      // phone login uses this mapping to resolve phone -> email
      await db.ref(`phoneIndex/${phone}`).set({ email, uid });

      setSession(uid, profile);

      setMsg("regMsg", "Account created. Redirecting...", true);
      setTimeout(() => window.location.href = "./customer-dashboard.html", 300);
    } catch (err) {
      console.error(err);

      let msg = "Registration failed. Please try again.";
      if (err?.code === "auth/email-already-in-use") msg = "This email address is already registered. Please sign in.";
      else if (err?.code === "auth/weak-password") msg = "Password is too weak. Please use at least 8 characters.";
      else if (err?.code === "auth/invalid-email") msg = "Please enter a valid email address.";

      setMsg("regMsg", msg, false);
    }
  }

  // login: resolve identifier (email/phone) -> sign in -> load profile -> store session
  async function loginCustomer(e) {
    e.preventDefault();

    setText("loginIdentifierErr", "");
    setText("loginPasswordErr", "");
    setMsg("loginMsg", "");

    const identifierRaw = String($("loginIdentifier")?.value || "").trim();
    const password = String($("loginPassword")?.value || "");

    if (!identifierRaw) { setText("loginIdentifierErr", "Please enter your email or phone number."); return; }
    if (!password) { setText("loginPasswordErr", "Please enter your password."); return; }

    let email = "";

    try {
      // email path
      if (identifierRaw.includes("@")) {
        email = normEmail(identifierRaw);
      } else {
        // phone path: look up email from phoneIndex
        const phone = normPhone(identifierRaw);
        const snap = await db.ref(`phoneIndex/${phone}`).get();

        if (!snap.exists()) {
          setText("loginIdentifierErr", "We couldn’t find an account with that phone number.");
          return;
        }

        const val = snap.val();
        email = normEmail(val.email || val);
      }

      // sign in with resolved email
      const cred = await auth.signInWithEmailAndPassword(email, password);
      const uid = cred.user.uid;

      // load profile for UI/session
      const profSnap = await db.ref(`users/${uid}`).get();
      const profile = profSnap.exists() ? profSnap.val() : { email, role: "customer" };

      setSession(uid, profile);

      setMsg("loginMsg", "Signed in. Redirecting...", true);
      setTimeout(() => window.location.href = "./customer-dashboard.html", 250);
    } catch (err) {
      console.error(err);

      let msg = "Sign in failed. Please try again.";
      if (err?.code === "auth/invalid-credential" || err?.code === "auth/wrong-password") {
        msg = "Incorrect email/phone number or password.";
      } else if (err?.code === "auth/user-not-found") {
        msg = "Account not found. Please create an account first.";
      } else if (err?.code === "auth/too-many-requests") {
        msg = "Too many attempts. Please try again later.";
      }

      setMsg("loginMsg", msg, false);
    }
  }

  // hooks used by html pages
  window.Auth = {
    initCustomerRegister() {
      const form = $("registerForm");
      if (form) form.addEventListener("submit", registerCustomer);
    },
    initCustomerLogin() {
      const form = $("loginForm");
      if (form) form.addEventListener("submit", loginCustomer);
    }
  };
})();




