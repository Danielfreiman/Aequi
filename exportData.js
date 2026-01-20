import admin from 'firebase-admin';
import fs from 'fs';

// Substitua o caminho pelo caminho do arquivo JSON baixado
const serviceAccount = './firebase-service-account.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function exportCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  const data = snapshot.docs.map(doc => doc.data());
  fs.writeFileSync(`./${collectionName}.json`, JSON.stringify(data, null, 2));
  console.log(`Exported ${collectionName} data to ${collectionName}.json`);
}

// Lista de coleções a serem exportadas
const collections = [
  'categories',
  'rhEmployees',
  'rhTimeCards',
  'settings',
  'stores',
  'transactions',
  'usuarios'
];

collections.forEach(exportCollection);