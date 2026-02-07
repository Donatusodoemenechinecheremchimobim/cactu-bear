const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 Starting Cactus Bear Full Upgrade...\n");

/* ================================
   INSTALL REQUIRED PACKAGES
================================ */
console.log("📦 Installing dependencies...");
execSync(
  "npm install firebase framer-motion lenis flutterwave-react-v3",
  { stdio: "inherit" }
);

/* ================================
   CREATE LIB FOLDER IF NOT EXISTS
================================ */
if (!fs.existsSync("lib")) {
  fs.mkdirSync("lib");
}

/* ================================
   CREATE FIREBASE CONFIG
================================ */
const firebaseConfig = `
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
`;

fs.writeFileSync("lib/firebase.ts", firebaseConfig);

/* ================================
   CREATE NAIRA FORMATTER
================================ */
const currencyFile = `
export const formatNaira = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
};
`;

fs.writeFileSync("lib/currency.ts", currencyFile);

/* ================================
   FIX SMOOTH SCROLL (MODERN LENIS)
================================ */
const smoothScrollFile = `
"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.08,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return <>{children}</>;
}
`;

if (!fs.existsSync("components")) {
  fs.mkdirSync("components");
}

fs.writeFileSync("components/SmoothScroll.tsx", smoothScrollFile);

/* ================================
   REMOVE CARTEL PAGE
================================ */
const cartelPath = path.join("app", "cartel");

if (fs.existsSync(cartelPath)) {
  fs.rmSync(cartelPath, { recursive: true, force: true });
  console.log("🗑 Removed /cartel route");
}

/* ================================
   REPLACE NGN WITH NGN IN PROJECT
================================ */
function walk(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (
      file.endsWith(".tsx") ||
      file.endsWith(".ts") ||
      file.endsWith(".js")
    ) {
      let content = fs.readFileSync(fullPath, "utf8");

      content = content.replace(/NGN/g, "NGN");
      content = content.replace(/\₦/g, "₦");

      fs.writeFileSync(fullPath, content);
    }
  }
}

walk("./");

console.log("💰 Currency updated to NGN");

/* ================================
   CREATE FIRESTORE RULES FILE
================================ */
const rules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
      allow update, delete: if false;
    }

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /collections/{collectionId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`;

fs.writeFileSync("firestore.rules", rules);

console.log("🔐 Firestore rules file created");

/* ================================
   DONE
================================ */
console.log("\n🎉 FULL UPGRADE COMPLETE");
console.log("Next Steps:");
console.log("1. Add ENV variables to .env.local");
console.log("2. Upload firestore.rules in Firebase console");
console.log("3. Redeploy to Vercel");
