import { deleteApp, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDB8Y6QEKSu0PEklf95BgOBB5T6T1-VXAg",
  authDomain: "webrtc-d641c.firebaseapp.com",
  projectId: "webrtc-d641c",
  storageBucket: "webrtc-d641c.appspot.com",
  messagingSenderId: "70439564920",
  appId: "1:70439564920:web:45e9f2ad3fceecc3ba1f8d",
  measurementId: "G-H9CQZ946NP",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
async function stopFirebase() {
  await deleteApp(app);
}

export { db, stopFirebase };