import * as admin from 'firebase-admin';
import * as serviceAccount from './config/ticket-bus-80b74-firebase-adminsdk-nan3b-45bd7f70fe.json';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

export const bucket = admin.storage().bucket();