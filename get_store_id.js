const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
  });
}

const db = admin.firestore();

async function run() {
  const snapshot = await db.collection('stores').get();
  if (snapshot.empty) {
    console.log("No stores found in the database.");
  } else {
    console.log("Found the following stores:");
    snapshot.forEach(doc => {
      console.log(`- Name: ${doc.data().name}`);
      console.log(`  Store ID: ${doc.id}`);
      console.log(`  (Copy this ID into your .env.local for NEXT_PUBLIC_STORE_ID)`);
      console.log("--------------------------------------------------");
    });
  }
}

run().catch(console.error);
