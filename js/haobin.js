(function () {
  // dom helpers
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

  // input cleanup
  function normEmail(v) {
    return String(v || "").trim().toLowerCase();
  }

  function normPhone(v) {
    return String(v || "").replace(/\s+/g, "").trim();
  }

  // firebase guard
  if (!window.firebase) {
    window.Auth = {
      initCustomerRegister() {},
      initCustomerLogin() {}
    };
    window.Feedback = {
      initGiveFeedback() {}
    };
    return;
  }

  // firebase services
  const auth = firebase.auth();
  const db = firebase.database();

  // local session storage
  function setSession(uid, profile) {
    localStorage.setItem("tempUserId", uid);
    localStorage.setItem("hcms_currentCustomer", JSON.stringify({ uid, ...profile }));
  }

  // customer register
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
      // block duplicate phone number
      const phoneSnap = await db.ref(`phoneIndex/${phone}`).get();
      if (phoneSnap.exists()) {
        setText("regPhoneErr", "This phone number is already registered.");
        return;
      }

      // create auth account
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      const uid = cred.user.uid;

      // save profile in rtdb
      const profile = {
        name,
        email,
        phone,
        role: "customer",
        createdAt: new Date().toISOString()
      };

      await db.ref(`users/${uid}`).set(profile);

      // map phone -> uid/email for phone login
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

  // customer login (email or phone)
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
      if (identifierRaw.includes("@")) {
        email = normEmail(identifierRaw);
      } else {
        const phone = normPhone(identifierRaw);
        const snap = await db.ref(`phoneIndex/${phone}`).get();

        if (!snap.exists()) {
          setText("loginIdentifierErr", "We couldn’t find an account with that phone number.");
          return;
        }

        const val = snap.val();
        email = normEmail(val.email || val);
      }

      const cred = await auth.signInWithEmailAndPassword(email, password);
      const uid = cred.user.uid;

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

  // url params (feedback page)
  function getQueryParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key) || "";
  }

  // require signed-in customer for protected actions
  function requireCustomer() {
    return new Promise((resolve) => {
      auth.onAuthStateChanged((user) => {
        if (!user) {
          window.location.href = "./customer-login.html";
          return;
        }
        resolve(user);
      });
    });
  }

  // feedback submit -> write to rtdb
  async function submitFeedback(e) {
    e.preventDefault();

    setText("fbRatingErr", "");
    setText("fbCommentErr", "");
    setMsg("fbMsg", "");

    const stallId = String($("fbStallId")?.value || "").trim();
    const stallName = String($("fbStallName")?.value || "").trim();

    const firstName = String($("fbFirstName")?.value || "").trim();
    const lastName = String($("fbLastName")?.value || "").trim();
    const phone = String($("fbPhone")?.value || "").trim();
    const emailField = String($("fbEmail")?.value || "").trim();

    const rating = Number($("fbRating")?.value || 0);
    const comment = String($("fbComment")?.value || "").trim();

    if (!stallId) { setMsg("fbMsg", "Missing stall details.", false); return; }
    if (!(rating >= 1 && rating <= 5)) { setText("fbRatingErr", "Please select a rating."); return; }
    if (comment.length < 5) { setText("fbCommentErr", "Please enter at least 5 characters."); return; }

    try {
      const user = await requireCustomer();
      const uid = user.uid;

      const feedbackId = db.ref().push().key;

      const payload = {
        feedbackId,
        stallId,
        stallName,
        uid,
        firstName,
        lastName,
        phone,
        email: user.email || emailField,
        rating,
        comment,
        createdAt: new Date().toISOString()
      };

      const updates = {};
      updates[`feedbackByStall/${stallId}/${feedbackId}`] = payload;
      updates[`feedbackByUser/${uid}/${feedbackId}`] = payload;

      await db.ref().update(updates);

      setMsg("fbMsg", "Feedback submitted.", true);
      setTimeout(() => window.history.back(), 400);
    } catch (err) {
      console.error(err);
      setMsg("fbMsg", "Could not submit feedback. Please try again.", false);
    }
  }

  // page hooks
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

  window.Feedback = {
    initGiveFeedback() {
      const stallId = getQueryParam("stallId");
      const stallName = getQueryParam("stallName");

      if ($("fbStallId")) $("fbStallId").value = stallId;
      if ($("fbStallName")) $("fbStallName").value = stallName;

      const form = $("feedbackForm");
      if (form) form.addEventListener("submit", submitFeedback);
    }
  };
})();





