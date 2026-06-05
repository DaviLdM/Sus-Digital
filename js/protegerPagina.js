import { auth }
from "./firebase.js";

import {
  onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {

  if (!user) {

    window.location.href =
      "login.html";

  }

});