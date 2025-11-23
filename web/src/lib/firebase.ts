import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { firebaseConfig } from '$lib/firebaseConfig';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function saveToFirebase(collectionName: string, data: any) {
	const docRef = await addDoc(collection(db, collectionName), data);
	return docRef.id;
}

export async function updateFirebaseDoc(collectionName: string, docId: string, data: any) {
	await updateDoc(doc(db, collectionName, docId), data);
}
