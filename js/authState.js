import { auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const guestMenu =
    document.getElementById("guestMenu");

const userMenu =
    document.getElementById("userMenu");

const userName =
    document.getElementById("userName");

const logoutBtn =
    document.getElementById("logoutBtn");

onAuthStateChanged(auth, (user) => {

    if (user) {

        guestMenu.style.display = "none";

        userMenu.style.display = "flex";

        userName.innerText =
            `Olá, ${user.email}`;

    }

    else {

        guestMenu.style.display = "flex";

        userMenu.style.display = "none";

    }

});
