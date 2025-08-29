// =================================================================
// PHASE 1: FIREBASE & APP CHECK INITIALISIERUNG
// =================================================================

// Importiere ALLE benötigten Funktionen von Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendEmailVerification, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
    initializeAppCheck, 
    ReCaptchaV3Provider 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-check.js";

// Deine Web-App's Firebase-Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyASH5eb9QibUHy7OBq962wU0N6QfXogjRY",
  authDomain: "davids-login-portal.firebaseapp.com",
  projectId: "davids-login-portal",
  storageBucket: "davids-login-portal.firebasestorage.app",
  messagingSenderId: "744380606646",
  appId: "1:744380606646:web:3afcf28b451c49fc39de17"
};

// Initialisiere Firebase
const app = initializeApp(firebaseConfig );
const auth = getAuth(app);

// Initialisiere App Check mit deinem reCAPTCHA v3 Websiteschlüssel
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LcojrcrAAAAAKycuW7P_8KcCWihCeS5fRgV2UVZM'),
  isTokenAutoRefreshEnabled: true
});


// =================================================================
// PHASE 2: LOGIK FÜR DIE index.html (Login & Registrierung)
// =================================================================

if (document.getElementById('register-button')) {
    
    const registerEmailInput = document.getElementById('register-email');
    const registerPasswordInput = document.getElementById('register-password');
    const registerButton = document.getElementById('register-button');
    const errorMessage = document.getElementById('error-message');
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const loginButton = document.getElementById('login-button');

    registerButton.addEventListener('click', () => {
        const email = registerEmailInput.value;
        const password = registerPasswordInput.value;
        errorMessage.textContent = '';
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                sendEmailVerification(user)
                    .then(() => {
                        alert("Registrierung erfolgreich! Bitte überprüfe dein E-Mail-Postfach (auch den Spam-Ordner).");
                    });
            })
            .catch((error) => {
                errorMessage.textContent = getFriendlyErrorMessage(error.code);
            });
    });

    loginButton.addEventListener('click', () => {
        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;
        errorMessage.textContent = '';
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                if (user.emailVerified) {
                    window.location.href = 'geheim.html';
                } else {
                    alert("Bitte verifiziere zuerst deine E-Mail-Adresse.");
                }
            })
            .catch((error) => {
                errorMessage.textContent = getFriendlyErrorMessage(error.code);
            });
    });
}


// =================================================================
// PHASE 3: LOGIK FÜR DIE geheim.html (Geschützte Seite)
// =================================================================

if (document.getElementById('logout-button')) {
    
    const userEmailElement = document.getElementById('user-email-nav');
    const logoutButton = document.getElementById('logout-button');

    onAuthStateChanged(auth, (user) => {
        if (user && user.emailVerified) {
            userEmailElement.textContent = user.email;
        } else {
            alert("Du musst angemeldet und verifiziert sein, um diese Seite zu sehen.");
            window.location.href = 'index.html';
        }
    });

    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth).then(() => {
            alert("Du wurdest erfolgreich abgemeldet.");
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error("Fehler beim Abmelden: ", error);
        });
    });
}


// =================================================================
// PHASE 4: HELFER-FUNKTION
// =================================================================

function getFriendlyErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/email-already-in-use': return 'Diese E-Mail-Adresse wird bereits verwendet.';
        case 'auth/invalid-email': return 'Das ist keine gültige E-Mail-Adresse.';
        case 'auth/weak-password': return 'Das Passwort ist zu schwach (mindestens 6 Zeichen).';
        case 'auth/user-not-found': return 'Kein Benutzer mit dieser E-Mail-Adresse gefunden.';
        case 'auth/wrong-password': return 'Falsches Passwort. Bitte versuche es erneut.';
        // App Check Fehler
        case 'auth/app-not-authorized': return 'Sicherheitsfehler: Die App ist nicht für die Authentifizierung autorisiert.';
        case 'auth/app-check-token-is-invalid': return 'Sicherheits-Token ungültig. Bitte lade die Seite neu.';
        default: return 'Ein unbekannter Fehler ist aufgetreten. Bitte versuche es erneut.';
    }
}
