import { db } from '../firebase-config.js';
import { collection, addDoc, getDocs, serverTimestamp, orderBy, query } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// មុខងារបញ្ចូលអតិថិជនថ្មី
export async function createCustomer(customerData) {
    try {
        const docRef = await addDoc(collection(db, "customers"), {
            ...customerData,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Database Write Error: ", error);
        throw error;
    }
}

// មុខងារទាញយកអតិថិជនទាំងអស់ (មានតម្រៀបតាមពេលវេលា)
export async function getAllCustomers() {
    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const customers = [];
        querySnapshot.forEach((doc) => {
            customers.push({ id: doc.id, ...doc.data() });
        });
        return customers;
    } catch (error) {
        console.error("Database Read Error: ", error);
        throw error;
    }
}