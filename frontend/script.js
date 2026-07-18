// ============================================================
// Firebase SDK Modules & Initialization Engine
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, doc, setDoc, addDoc, getDoc, collection, getDocs, query, deleteDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Your verified Firebase configuration metrics
const firebaseConfig = {
  apiKey: "AIzaSyBn4Utc6jWO8xJ-_2Sp-D2Bm_N7DZXk2SY",
  authDomain: "tiem-eventsphere.firebaseapp.com",
  projectId: "tiem-eventsphere",
  storageBucket: "tiem-eventsphere.firebasestorage.app",
  messagingSenderId: "132825830379",
  appId: "1:132825830379:web:198ccacf897b8427d17fae",
  measurementId: "G-9ENGRE52TP"
};

// Initialize Core App Infrastructure
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Admin Security Setup
const ADMIN_SECRET = "TIEM@Admin2025"; 

// Active Runtime Context States
let currentUser = null;
let isAdmin = false;
let isSignUpMode = true; 
let _soloEvent = '';
let _teamSport = '';

// Core Datasets
const eventsData = [
    {
        name: "Annual Fest - Ullash",
        detail: "The college's largest cultural fest featuring music, dance, and drama.",
        image: "images/fest.jpg",
        venue: "Ashoknagar Sahid Sadan Manch"
    },
    {
        name: "Freshers' - Freshtopia 2.0",
        detail: "A warm welcome party for the incoming 2025 batch of students.",
        image: "images/fresher.jpeg",
        venue: "Shahid Sadan Town Hall, Ashoknagar"
    },
    {
        name: "College Sports - Sportivo 5.0",
        detail: "Compete in cricket, volleyball, Kho-Kho and more across the campus grounds.",
        image: "images/sports.jpg",
        venue: "TECB Campus Ground & PGGIPE Ground"
    },
    {
        name: "Holi Celebration - Splash!",
        detail: "A colorful event with Live DJ, Dance & Singing to celebrate the festival of colors.",
        image: "images/holi.jpg",
        venue: "TECB College Campus"
    },
    {
        name: "Teachers' Day Celebration",
        detail: "A special day to honor our respected faculty members with cultural performances.",
        image: "images/teachers-day.jpg",
        venue: "College Auditorium"
    }
];

const CULTURAL_EVENTS = ["Annual Fest - Ullash", "Freshers' - Freshtopia 2.0", "Holi Celebration - Splash!", "Teachers' Day Celebration"];
const GROUP_EVENTS = ["Annual Fest - Ullash", "Freshers' - Freshtopia 2.0"];
const EVENT_ACTIVITIES = {
    "Annual Fest - Ullash":         ["Singing", "Dancing", "Shayeri", "Poem"],
    "Freshers' - Freshtopia 2.0":   ["Singing", "Dancing", "Shayeri", "Poem"],
    "Holi Celebration - Splash!":   ["Singing", "Dancing", "Shayeri", "Poem"],
    "Teachers' Day Celebration":    ["Singing", "Dancing", "Shayeri", "Poem"]
};
const SPORTS_EVENTS = ['100m Race','Discus Throw','Shot Put','Long Jump','Football','Cricket','Volleyball','Tug Of War','Badminton','Kho-Kho','400m Relay Race','Musical Chair'];

// ============================================================
// Core Routing & Page Navigation System
// ============================================================
function showPage(pageId) {
    const protectedPages = ['reg-history', 'events', 'registration', 'sports-main', 'solo-athletics', 'solo-gender', 'solo-reg', 'team-games', 'team-gender', 'team-reg', 'musical-chair'];

    if (protectedPages.includes(pageId) && !currentUser) {
        showToast('Please sign in or create an account to continue.', 'error');
        pageId = 'auth-section';
    }

    document.querySelectorAll('.page-section').forEach(s => s.style.display = 'none');
    const targetSection = document.getElementById(pageId);
    if (targetSection) targetSection.style.display = 'block';

    window.scrollTo(0, 0);

    if (pageId === 'events') populateEventsList();
    if (pageId === 'admin-login') resetAdminView();
    if (pageId === 'reg-history') loadRegHistory();
}

function showSportsSection(id) {
    document.querySelectorAll('.page-section').forEach(s => s.style.display = 'none');
    const element = document.getElementById(id);
    if (element) element.style.display = 'block';
    window.scrollTo(0, 0);
}

// ============================================================
// Active Session State Monitoring Lifecycle Hook
// ============================================================
onAuthStateChanged(auth, async (user) => {
    const loginNav = document.getElementById('nav-login-btn');
    const logoutNav = document.getElementById('nav-logout-btn');
    const adminNav = document.getElementById('nav-admin-btn');
    
    if (user) {
        currentUser = user;
        if (loginNav) loginNav.style.display = 'none';
        if (logoutNav) logoutNav.style.display = 'inline-block';
        
        try {
            const adminSnap = await getDoc(doc(db, "admins", user.uid));
            if (adminSnap.exists()) {
                isAdmin = true;
                if (adminNav) adminNav.style.display = 'inline-block';
            } else {
                isAdmin = false;
                if (adminNav) adminNav.style.display = 'none';
            }
        } catch(e) {
            isAdmin = false;
            if (adminNav) adminNav.style.display = 'none';
        }
        
        const currentVisible = document.querySelector('.page-section[style="display: block;"]')?.id;
        if (currentVisible === 'auth-section') {
            showPage(isAdmin ? 'admin-login' : 'events');
        }
    } else {
        currentUser = null;
        isAdmin = false;
        if (loginNav) loginNav.style.display = 'inline-block';
        if (logoutNav) logoutNav.style.display = 'none';
        if (adminNav) adminNav.style.display = 'none';
        
        document.getElementById('admin-data-preview').style.display = 'none';
        document.getElementById('admin-login-box').style.display = 'flex';
        
        showPage('home');
    }
});

// ============================================================
// Auth Role Tab Switcher
// ============================================================
let isAdminAuthSignUpMode = false;

window.switchAuthRole = function(role) {
    const studentPanel = document.getElementById('student-auth-panel');
    const adminPanel   = document.getElementById('admin-auth-panel');
    const tabStudent   = document.getElementById('tab-student');
    const tabAdmin     = document.getElementById('tab-admin');

    if (role === 'student') {
        studentPanel.style.display = 'block';
        adminPanel.style.display   = 'none';
        tabStudent.classList.add('active');
        tabAdmin.classList.remove('active');
    } else {
        studentPanel.style.display = 'none';
        adminPanel.style.display   = 'block';
        tabStudent.classList.remove('active');
        tabAdmin.classList.add('active');
        // reset admin panel to login mode when switching to it
        isAdminAuthSignUpMode = false;
        _setAdminAuthMode(false);
    }
};

function _setAdminAuthMode(signUp) {
    isAdminAuthSignUpMode = signUp;
    document.getElementById('admin-auth-title').textContent  = signUp ? "Admin Sign Up" : "Admin Sign In";
    document.getElementById('admin-auth-sub').textContent    = signUp ? "Create a new admin account with the secret key." : "Sign in with your admin credentials to access the dashboard.";
    document.getElementById('admin-auth-submit-btn').textContent = signUp ? "Create Admin Account ✓" : "Sign In →";
    document.getElementById('admin-auth-toggle-link').textContent = signUp ? "Already have an admin account? Sign In" : "New admin? Create Admin Account";
    document.getElementById('admin-secret-field').style.display  = signUp ? 'block' : 'none';
    document.getElementById('admin-auth-msg').textContent = '';
}

document.getElementById('admin-auth-toggle-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    _setAdminAuthMode(!isAdminAuthSignUpMode);
});

// ============================================================
// Student Auth Logic Handler
// ============================================================
document.getElementById('auth-toggle-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    isSignUpMode = !isSignUpMode;
    document.getElementById('auth-title').textContent = isSignUpMode ? "Student Sign Up" : "Student Log In";
    document.getElementById('auth-sub').textContent = isSignUpMode ? "Create your credential profile to unlock event authorization access." : "Sign in with your email and password to continue.";
    document.getElementById('auth-submit-btn').textContent = isSignUpMode ? "Create Account ✓" : "Log In →";
    document.getElementById('auth-toggle-link').textContent = isSignUpMode ? "Already have a student profile? Log In" : "Don't have an account? Sign Up";
    document.getElementById('student-auth-msg').textContent = '';
});

document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const msgEl    = document.getElementById('student-auth-msg');
    msgEl.textContent = '';

    try {
        if (isSignUpMode) {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "users", credential.user.uid), { email, role: 'student' });
            showToast("Student profile established successfully!", "success");
        } else {
            // Prevent admin from logging in via student form
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const adminSnap = await getDoc(doc(db, "admins", cred.user.uid));
            if (adminSnap.exists()) {
                await signOut(auth);
                msgEl.style.color = '#e02424';
                msgEl.textContent = 'This is an admin account. Please use the Admin tab to sign in.';
                return;
            }
            showToast("Logged in successfully!", "success");
        }
        showPage('events');
    } catch (err) {
        msgEl.style.color = '#e02424';
        msgEl.textContent = err.message;
    }
});

// ============================================================
// Admin Auth Form Handler (in auth-section)
// ============================================================
document.getElementById('admin-auth-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('admin-auth-email').value.trim();
    const password = document.getElementById('admin-auth-password').value;
    const msgEl    = document.getElementById('admin-auth-msg');
    msgEl.textContent = '';

    try {
        if (isAdminAuthSignUpMode) {
            const secret = document.getElementById('admin-secret-input').value;
            if (secret !== ADMIN_SECRET) {
                msgEl.style.color = '#e02424';
                msgEl.textContent = 'Invalid admin secret key.';
                return;
            }
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "admins", credential.user.uid), { email, role: 'admin', createdAt: new Date().toISOString() });
            await setDoc(doc(db, "users", credential.user.uid), { email, role: 'admin' });
            isAdmin = true;
            showToast("Admin account created successfully!", "success");
            showPage('admin-login');
        } else {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const adminSnap = await getDoc(doc(db, "admins", cred.user.uid));
            if (!adminSnap.exists()) {
                await signOut(auth);
                msgEl.style.color = '#e02424';
                msgEl.textContent = 'Access denied. This account does not have admin privileges.';
                return;
            }
            isAdmin = true;
            showToast("Welcome back, Admin!", "success");
            showPage('admin-login');
        }
    } catch (err) {
        msgEl.style.color = '#e02424';
        msgEl.textContent = err.message;
    }
});

document.getElementById('nav-logout-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    signOut(auth).then(() => {
        showToast('Logged out securely.', 'success');
    }).catch(err => showToast(err.message, 'error'));
});

// ============================================================
// Events List Generator Engine
// ============================================================
function populateEventsList() {
    const container = document.getElementById('events-list-container');
    if (!container) return;
    container.innerHTML = '';

    eventsData.forEach(event => {
        const item = document.createElement('div');
        item.classList.add('event-item');
        item.innerHTML = `
            <img class="event-img" src="${event.image}" alt="${event.name}">
            <div class="event-info">
                <h4>${event.name}</h4>
                <p>${event.detail}</p>
                <div class="event-meta">
                    <span>📍 ${event.venue}</span>
                </div>
            </div>
            <button class="btn-register">Register</button>
        `;
        item.querySelector('.btn-register').addEventListener('click', () => {
            if (event.name === 'College Sports - Sportivo 5.0') {
                showSportsSection('sports-main');
            } else {
                openRegistrationForm(event.name);
            }
        });
        container.appendChild(item);
    });
}

function isCulturalEvent(name) { return CULTURAL_EVENTS.includes(name); }
function isSportsEvent(eventName) { return SPORTS_EVENTS.includes(eventName); }

// ============================================================
// Unified Database Write & Duplication Filter Engine
// ============================================================
async function executeSecureRegistration(formData, messageElementId) {
    if (!currentUser) { showToast('Authentication token expired. Re-login.', 'error'); return; }

    formData.userId = currentUser.uid;
    formData.timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    try {
        const snapshot = await getDocs(collection(db, "registrations"));
        let duplicateMatch = false;

        snapshot.forEach((doc) => {
            const r = doc.data();
            if (formData.type === 'team') {
                if (r.event === formData.event && r.team_name && r.team_name.toLowerCase() === formData.team_name.toLowerCase()) {
                    duplicateMatch = true;
                }
            } else {
                if (r.event === formData.event && r.name && r.name.toLowerCase() === formData.name.toLowerCase() && r.department === formData.department && r.year === formData.year) {
                    duplicateMatch = true;
                }
            }
        });

        if (duplicateMatch) {
            showToast(formData.type === 'team' ? `Team "${formData.team_name}" has already registered for this slot!` : `${formData.name}, an entry already exists for this configuration!`, 'error');
            return;
        }

        await addDoc(collection(db, "registrations"), formData);

        const msgEl = document.getElementById(messageElementId);
        if (msgEl) {
            msgEl.innerHTML = `
                <div class="success-card">
                    <div class="success-icon">✅</div>
                    <h3>Cloud Sync Successful!</h3>
                    <p>Registration metrics saved safely inside Firestore.</p>
                    <p class="success-sub">Routing back to overview index...</p>
                </div>
            `;
            msgEl.style.display = 'block';
            setTimeout(() => { msgEl.style.display = 'none'; showPage('events'); }, 3000);
        }
    } catch (error) {
        showToast(`Cloud synchronization rejected: ${error.message}`, 'error');
    }
}

// ============================================================
// Dynamic Form Logic Subsystem
// ============================================================
function openRegistrationForm(eventName) {
    document.getElementById('reg-event').value = eventName;
    document.getElementById('reg-form-title').textContent = `Register for: ${eventName}`;
    document.getElementById('reg-message').style.display = 'none';
    document.getElementById('registration-form').reset();
    document.getElementById('reg-event').value = eventName;

    const cultural = isCulturalEvent(eventName);
    document.getElementById('field-year-radio').style.display  = cultural ? 'block' : 'none';
    document.getElementById('field-year-select').style.display = cultural ? 'none'  : 'block';

    const activityBox = document.getElementById('field-activity');
    if (cultural && EVENT_ACTIVITIES[eventName]) {
        const opts = EVENT_ACTIVITIES[eventName];
        document.getElementById('activity-options').innerHTML = opts.map(o =>
            `<label class="radio-label"><input type="radio" name="activity" value="${o}"> ${o}</label>`
        ).join('');
        activityBox.style.display = 'block';
    } else {
        activityBox.style.display = 'none';
    }

    const showGroup = GROUP_EVENTS.includes(eventName);
    document.getElementById('field-group-type').style.display         = showGroup ? 'block' : 'none';
    document.getElementById('field-group-name').style.display         = showGroup ? 'block' : 'none';
    document.getElementById('field-group-participants').style.display  = showGroup ? 'block' : 'none';

    showPage('registration');
}

document.getElementById('registration-form')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const eventName = document.getElementById('reg-event').value;
    const cultural  = isCulturalEvent(eventName);
    let year = cultural ? (document.querySelector('input[name="year_radio"]:checked')?.value || '') : document.getElementById('reg-year').value;

    const formData = {
        type:       'cultural',
        event:      eventName,
        name:       document.getElementById('reg-name').value.trim(),
        email:      document.getElementById('reg-email').value.trim(),
        department: document.getElementById('reg-dept').value,
        year:       year,
        phone:      document.getElementById('reg-phone').value.trim()
    };

    if (cultural) {
        formData.activity = document.querySelector('input[name="activity"]:checked')?.value || '';
        if (GROUP_EVENTS.includes(eventName)) {
            formData.group_type         = document.querySelector('input[name="group_type"]:checked')?.value || '';
            formData.group_name         = document.getElementById('reg-group-name').value.trim();
            formData.group_participants = document.getElementById('reg-group-participants').value.trim();
        }
    }

    if (!formData.name || !formData.email || !formData.department || !year) {
        showToast('Please fill in all required fields.', 'error'); return;
    }
    if (cultural && !formData.activity) {
        showToast('Please select an activity.', 'error'); return;
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
        showToast('Please enter a valid 10-digit phone number.', 'error'); return;
    }

    executeSecureRegistration(formData, 'reg-message');
});

// ============================================================
// Athletics & Sports Module Execution Matrix
// ============================================================
function openSoloForm(eventName, gender) {
    _soloEvent = eventName;
    document.getElementById('solo-event-hidden').value = eventName;
    document.getElementById('solo-category-hidden').value = gender;
    document.getElementById('solo-reg-title').textContent = `${eventName} — Registration`;
    document.getElementById('solo-reg-badge').innerHTML = `🏅 Event: <strong>${eventName}</strong> &nbsp;|&nbsp; Category: <strong>${gender}</strong>`;
    document.getElementById('solo-reg-form').reset();
    document.getElementById('solo-reg-message').style.display = 'none';
    document.getElementById('solo-email-status').textContent = '';
    showSportsSection('solo-reg');
}

function openSoloFormFromGender(gender) {
    openSoloForm(_soloEvent, gender);
}

document.getElementById('solo-reg-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = {
        type:       'solo',
        event:      document.getElementById('solo-event-hidden').value,
        category:   document.getElementById('solo-category-hidden').value,
        name:       document.getElementById('solo-name').value.trim(),
        phone:      document.getElementById('solo-phone').value.trim(),
        email:      document.getElementById('solo-email').value.trim(),
        year:       document.getElementById('solo-year').value,
        roll:       document.getElementById('solo-roll').value.trim(),
        department: document.getElementById('solo-dept').value
    };

    if (!formData.name || !formData.phone || !formData.email || !formData.year || !formData.roll || !formData.department) {
        showToast('Please fill in all required fields.', 'error'); return;
    }
    if (!/^\d{10}$/.test(formData.phone)) { showToast('Please enter a valid 10-digit phone number.', 'error'); return; }

    executeSecureRegistration(formData, 'solo-reg-message');
});

function openTeamForm(sport, category) {
    _teamSport = sport;
    document.getElementById('team-sport-hidden').value = sport;
    document.getElementById('team-category-hidden').value = category;
    const label = category ? `${sport} (${category})` : sport;
    document.getElementById('team-reg-title').textContent = `${label} — Team Registration`;
    document.getElementById('team-reg-badge').innerHTML = `⚽ Sport: <strong>${sport}</strong>` + (category ? ` &nbsp;|&nbsp; Category: <strong>${category}</strong>` : '');
    document.getElementById('team-reg-form').reset();
    document.getElementById('team-reg-message').style.display = 'none';
    document.getElementById('team-email-status').textContent = '';

    const noGenderSports = ['Football', 'Cricket', 'Volleyball'];
    document.getElementById('field-team-gender').style.display = noGenderSports.includes(sport) ? 'none' : 'block';

    showSportsSection('team-reg');
}

function openTeamFormFromGender(gender) {
    openTeamForm(_teamSport, gender);
}

function showSoloGender(eventName) {
    _soloEvent = eventName;
    document.getElementById('solo-gender-event-name').textContent = eventName;
    document.getElementById('solo-gender-title').textContent = `${eventName} — Select Category`;
    showSportsSection('solo-gender');
}

function showTeamGender(sport) {
    _teamSport = sport;
    document.getElementById('team-gender-event-name').textContent = sport;
    document.getElementById('team-gender-title').textContent = `${sport} — Select Category`;
    showSportsSection('team-gender');
}

document.getElementById('team-reg-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const sport = document.getElementById('team-sport-hidden').value;
    const noGenderSports = ['Football', 'Cricket', 'Volleyball'];
    
    const formData = {
        type:              'team',
        event:             sport,
        category:          document.getElementById('team-category-hidden').value,
        name:              document.getElementById('team-captain').value.trim(),
        phone:             document.getElementById('team-phone').value.trim(),
        email:             document.getElementById('team-email').value.trim(),
        year:              document.getElementById('team-year').value,
        department:        document.getElementById('team-dept').value,
        team_name:         document.getElementById('team-name').value.trim(),
        players:           document.getElementById('team-players').value.trim(),
        gender:            noGenderSports.includes(sport) ? '' : document.getElementById('team-gender').value
    };

    if (!formData.name || !formData.phone || !formData.email || !formData.year || !formData.department || !formData.team_name || !formData.players) {
        showToast('Please fill in all required fields.', 'error'); return;
    }
    if (!noGenderSports.includes(sport) && !formData.gender) { showToast('Please select a gender category.', 'error'); return; }
    if (!/^\d{10}$/.test(formData.phone)) { showToast('Please enter a valid 10-digit phone number.', 'error'); return; }

    executeSecureRegistration(formData, 'team-reg-message');
});

document.getElementById('musical-chair-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = {
        type:       'solo',
        event:      'Musical Chair',
        category:   'Girls',
        name:       document.getElementById('mc-name').value.trim(),
        phone:      document.getElementById('mc-phone').value.trim(),
        email:      document.getElementById('mc-email').value.trim(),
        year:       document.getElementById('mc-year').value,
        roll:       document.getElementById('mc-roll').value.trim(),
        department: document.getElementById('mc-dept').value
    };

    if (!formData.name || !formData.phone || !formData.email || !formData.year || !formData.roll || !formData.department) {
        showToast('Please fill in all required fields.', 'error'); return;
    }
    if (!/^\d{10}$/.test(formData.phone)) { showToast('Please enter a valid 10-digit phone number.', 'error'); return; }

    executeSecureRegistration(formData, 'mc-reg-message');
});

function verifyEmail(inputId, statusId) {
    const val = document.getElementById(inputId).value.trim();
    const status = document.getElementById(statusId);
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) {
        status.textContent = '⚠ Enter an email address.';
        status.className = 'verify-status verify-error';
        return;
    }
    if (!re.test(val)) {
        status.textContent = '✗ Invalid email format.';
        status.className = 'verify-status verify-error';
        return;
    }
    status.textContent = '✓ Email format verified.';
    status.className = 'verify-status verify-ok';
}

// ============================================================
// Back-End Cloud Management Panel (Admin Portal)
// ============================================================
function resetAdminView() {
    if (!currentUser || !isAdmin) {
        document.getElementById('admin-data-preview').style.display = 'none';
        document.getElementById('admin-login-box').style.display = 'flex';
    } else {
        document.getElementById('admin-login-box').style.display = 'none';
        document.getElementById('admin-data-preview').style.display = 'block';
        renderAdminDashboard();
    }
}

document.getElementById('admin-form')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById('admin-user').value.trim();
    const pass = document.getElementById('admin-pass').value;
    const msgEl = document.getElementById('admin-message');

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        const adminSnap = await getDoc(doc(db, "admins", user.uid));
        if (adminSnap.exists()) {
            showToast('Administrative authorization granted.', 'success');
            resetAdminView();
        } else {
            msgEl.textContent = "Access Blocked: Account profile lacks admin tokens.";
            await signOut(auth);
        }
    } catch (err) {
        msgEl.textContent = `Login Failure: ${err.message}`;
    }
});

document.getElementById('admin-register-link')?.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = prompt("Enter new administrator verification email address:");
    if (!email) return;
    const password = prompt("Enter administrator authorization access password (min 6 chars):");
    if (!password || password.length < 6) { showToast("Error: Target password string too short.", "error"); return; }
    const secret = prompt("Enter the deployment system ADMIN_SECRET token key:");

    if (secret !== ADMIN_SECRET) {
        showToast("Authorization Denied: Invalid secret signature passphrase.", "error");
        return;
    }

    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", res.user.uid), { email, role: 'admin' });
        await setDoc(doc(db, "admins", res.user.uid), { active: true });
        showToast("New administrator keys created successfully!", "success");
    } catch (err) {
        showToast(`Registration Failed: ${err.message}`, "error");
    }
});

async function renderAdminDashboard() {
    if (!isAdmin) return;
    try {
        const snapshot = await getDocs(collection(db, "registrations"));
        const data = [];
        snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));

        const statsEl = document.getElementById('admin-stats');
        const filterEl = document.getElementById('admin-filter');
        const sportFilterEl = document.getElementById('admin-sport-filter');

        const eventCounts = {};
        data.forEach(r => { eventCounts[r.event] = (eventCounts[r.event] || 0) + 1; });
        statsEl.innerHTML = `
            <div class="stat-card"><span class="stat-num">${data.length}</span><span class="stat-label">Total Registrations</span></div>
            <div class="stat-card"><span class="stat-num">${Object.keys(eventCounts).length}</span><span class="stat-label">Active Event Pools</span></div>
            <div class="stat-card"><span class="stat-num">${[...new Set(data.map(r => r.department))].length}</span><span class="stat-label">Departments</span></div>
        `;

        const culturalEvents = [...new Set(data.filter(r => !isSportsEvent(r.event)).map(r => r.event))];
        const hasSports = data.some(r => isSportsEvent(r.event));
        const sportsInData = [...new Set(data.filter(r => isSportsEvent(r.event)).map(r => r.event))];

        filterEl.innerHTML = '<option value="">All Events</option>';
        culturalEvents.forEach(ev => { filterEl.innerHTML += `<option value="${ev}">${ev}</option>`; });
        if (hasSports) { filterEl.innerHTML += `<option value="__sports__">Sports</option>`; }

        sportFilterEl.innerHTML = '<option value="">All Sports</option>';
        sportsInData.forEach(ev => { sportFilterEl.innerHTML += `<option value="${ev}">${ev}</option>`; });
        sportFilterEl.style.display = 'none';

        renderTable(data);
    } catch (err) {
        showToast(`Failed to parse dashboard items: ${err.message}`, "error");
    }
}

function renderTable(data) {
    const tableEl = document.getElementById('admin-data-table');
    if (!tableEl) return;
    if (data.length === 0) {
        tableEl.innerHTML = `<tr><td colspan="9" class="empty-row">No data verified.</td></tr>`;
        return;
    }

    tableEl.innerHTML = `
        <thead>
            <tr>
                <th>#</th>
                <th>Event</th>
                <th>Name</th>
                <th>Dept.</th>
                <th>Year</th>
                <th>Activity</th>
                <th>Group</th>
                <th>Phone</th>
                <th>Registered On</th>
            </tr>
        </thead>
        <tbody>
            ${data.map((r, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td><span class="event-badge">${r.event.split(' - ')[0]}</span></td>
                    <td>${r.name}</td>
                    <td>${r.department}</td>
                    <td>${formatYear(r.year)}</td>
                    <td>${r.activity || '—'}</td>
                    <td>${r.group_name ? `${r.group_type || ''} · ${r.group_name}` : '—'}</td>
                    <td>${r.phone || '—'}</td>
                    <td>${r.timestamp || '—'}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
}

function formatYear(y) {
    if (!y) return '—';
    if (isNaN(y)) return y;
    const suffixes = ['st', 'nd', 'rd', 'th'];
    return `${y}${suffixes[y - 1] || 'th'} Year`;
}

async function filterTable() {
    const filterVal     = document.getElementById('admin-filter').value;
    const sportVal      = document.getElementById('admin-sport-filter').value;
    const genderVal     = document.getElementById('admin-gender-filter').value;
    const searchVal     = document.getElementById('admin-search').value.toLowerCase();
    const sportFilterEl  = document.getElementById('admin-sport-filter');
    const genderFilterEl = document.getElementById('admin-gender-filter');
    
    try {
        const snapshot = await getDocs(collection(db, "registrations"));
        let filtered = [];
        snapshot.forEach(doc => filtered.push(doc.data()));

        if (filterVal === '__sports__') {
            sportFilterEl.style.display = 'block';
        } else {
            sportFilterEl.style.display = 'none';
            sportFilterEl.value = '';
            genderFilterEl.style.display = 'none';
            genderFilterEl.value = '';
        }

        if (filterVal === '__sports__' && sportVal) {
            genderFilterEl.style.display = 'block';
        } else if (filterVal === '__sports__') {
            genderFilterEl.style.display = 'none';
            genderFilterEl.value = '';
        }

        if (filterVal === '__sports__') {
            filtered = filtered.filter(r => isSportsEvent(r.event));
            if (sportVal) filtered = filtered.filter(r => r.event === sportVal);
            if (sportVal && genderVal) {
                filtered = filtered.filter(r => {
                    const cat = (r.category || '').toLowerCase();
                    const gen = (r.gender || '').toLowerCase();
                    const target = genderVal.toLowerCase();
                    return cat === target || gen === target ||
                        (genderVal === 'Boys'  && (cat === 'boys'  || gen === 'male')) ||
                        (genderVal === 'Girls' && (cat === 'girls' || gen === 'female'));
                });
            }
        } else if (filterVal) {
            filtered = filtered.filter(r => r.event === filterVal);
        }

        if (searchVal) {
            filtered = filtered.filter(r =>
                r.name.toLowerCase().includes(searchVal) ||
                r.department.toLowerCase().includes(searchVal)
            );
        }
        renderTable(filtered);
    } catch (e) {
        showToast("Error processing data filters.", "error");
    }
}

async function exportCSV() {
    try {
        const snapshot = await getDocs(collection(db, "registrations"));
        const data = [];
        snapshot.forEach(doc => data.push(doc.data()));
        if (!data.length) { showToast('No data entries to export.', 'error'); return; }

        const headers = ['#','Event','Name','Department','Year','Activity','Group Type','Group Name','Group Participants','Phone','Email','Registered On'];
        const rows = data.map((r, i) =>
            [i+1, `"${r.event}"`, `"${r.name}"`, `"${r.department}"`, `"${r.year}"`, `"${r.activity||''}"`, `"${r.group_type||''}"`, `"${r.group_name||''}"`, `"${r.group_participants||''}"`, `"${r.phone||''}"`, `"${r.email||''}"`, `"${r.timestamp||''}"`].join(',')
        );
        const csv = [headers.join(','), ...rows].join('\n');
        const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
        const a = document.createElement('a');
        a.setAttribute('href', dataUri);
        a.setAttribute('download', 'TIEM_Registrations.csv');
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('CSV downloaded successfully!', 'success');
    } catch (err) {
        showToast("Failed to build data matrix compilation.", "error");
    }
}

async function clearRegistrations() {
    if (!confirm('CRITICAL ACTION: Drop ALL data collections permanently?')) return;
    try {
        const snapshot = await getDocs(collection(db, "registrations"));
        const deletePromises = [];
        snapshot.forEach((docSnap) => {
            deletePromises.push(deleteDoc(doc(db, "registrations", docSnap.id)));
        });
        await Promise.all(deletePromises);
        showToast("All items evicted successfully.", "success");
        renderAdminDashboard();
    } catch (e) {
        showToast(`Eviction failure: ${e.message}`, "error");
    }
}

function showToast(message, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3500);
}

// Bind navigation bridges to window global space
window.showPage = showPage;
window.showSportsSection = showSportsSection;
window.showSoloGender = showSoloGender;
window.showTeamGender = showTeamGender;
window.openSoloForm = openSoloForm;
window.openSoloFormFromGender = openSoloFormFromGender;
window.openTeamForm = openTeamForm;
window.openTeamFormFromGender = openTeamFormFromGender;
window.verifyEmail = verifyEmail;

// ============================================================
// Programmatic Module Scope Wiring Engine
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#nav-list a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(link.getAttribute('data-page'));
        });
    });

    document.getElementById('hero-explore-btn')?.addEventListener('click', () => showPage('events'));
    document.getElementById('reg-back-btn')?.addEventListener('click', () => showPage('events'));

    document.getElementById('admin-search')?.addEventListener('input', filterTable);
    document.getElementById('admin-filter')?.addEventListener('change', filterTable);
    document.getElementById('admin-sport-filter')?.addEventListener('change', filterTable);
    document.getElementById('admin-gender-filter')?.addEventListener('change', filterTable);
    document.getElementById('admin-export-btn')?.addEventListener('click', exportCSV);
    document.getElementById('admin-clear-btn')?.addEventListener('click', clearRegistrations);

    setTimeout(() => {
        showPage('home');
    }, 200);
});
// ============================================================
// Registration History — Student View
// ============================================================
async function loadRegHistory() {
    const container = document.getElementById('reg-history-container');
    if (!container) return;

    if (!currentUser) {
        container.innerHTML = `<div style="text-align:center; padding:40px 0;">
            <p style="color:var(--muted); margin-bottom:16px;">Please login to view your registrations.</p>
            <button onclick="window.showPage('auth-section')" class="btn-primary">Login / Sign Up</button>
        </div>`;
        return;
    }

    container.innerHTML = '<p style="color:var(--muted); text-align:center; padding:20px;">Loading...</p>';

    try {
        const snapshot = await getDocs(collection(db, 'registrations'));
        const data = [];
        snapshot.forEach(d => {
            const r = d.data();
            if (r.userId === currentUser.uid) data.push(r);
        });

        // Sort by timestamp descending
        data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (data.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:40px 0;">
                <p style="color:var(--muted); font-size:1.05rem; margin-bottom:16px;">You haven't registered for any events yet.</p>
                <button onclick="window.showPage('events')" class="btn-primary">Explore Events →</button>
            </div>`;
            return;
        }

        let html = '<div class="history-list">';
        data.forEach(r => {
            const isTeam = r.type === 'team';
            html += `<div class="history-card">
                <div class="history-badge">${isTeam ? '⚽ Team' : '🏅 Solo / Cultural'}</div>
                <h4>${r.event}${r.category ? ` <span class="gender-tag">${r.category}</span>` : ''}</h4>
                <div class="history-meta">
                    ${isTeam
                        ? `<span>👑 Captain: ${r.name}</span><span>🏷 Team: ${r.team_name || '—'}</span>`
                        : `<span>👤 ${r.name}</span>`}
                    ${r.activity ? `<span>🎭 ${r.activity}</span>` : ''}
                    <span>🏫 ${r.department}</span>
                    <span>📅 ${r.year}</span>
                    <span>🕐 ${r.timestamp}</span>
                </div>
            </div>`;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = `<p style="color:var(--red); text-align:center; padding:20px;">Error loading registrations: ${err.message}</p>`;
    }
}

window.loadRegHistory = loadRegHistory;
