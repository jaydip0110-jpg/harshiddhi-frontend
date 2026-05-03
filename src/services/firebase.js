import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// તમારો Firebase config અહીં નાખો
const firebaseConfig = {
  apiKey: "AIzaSyCQLEE-Av2m08ZCInYwMrI_0u6-Ly-huVA",
  authDomain: "harshiddhi-fashion.firebaseapp.com",
  projectId: "harshiddhi-fashion",
  storageBucket: "harshiddhi-fashion.firebasestorage.app",
  messagingSenderId: "1039799835049",
  appId: "1:1039799835049:web:625d6f8de4726b22a80cb8",
  measurementId: "G-XFTNLCH2J2"
};

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const provider = new GoogleAuthProvider();

provider.setCustomParameters({ prompt: 'select_account' });

export { auth, provider, signInWithPopup };