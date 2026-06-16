import { db } from '../firebase-config.js';
import { doc, collection, runTransaction, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// មុខងារបង្កើត Order ជាមួយប្រព័ន្ធការពារជាន់លេខ (Pessimistic Lock / Atomic Transaction)
export async function createSecureOrder(customerId, productDetails) {
    const currentYear = new Date().getFullYear();
    const counterRef = doc(db, "systemMetadata", "orderCounter");
    const newOrderRef = doc(collection(db, "orders"));

    try {
        return await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            let currentCount = 0;

            if (counterDoc.exists() && counterDoc.data().year === currentYear) {
                currentCount = counterDoc.data().count;
            } else if (counterDoc.exists() && counterDoc.data().year !== currentYear) {
                // ទម្លាក់លេខរៀងទៅសូន្យវិញនៅពេលឆ្លងឆ្នាំថ្មី
                currentCount = 0;
            }

            const nextCount = currentCount + 1;
            const orderNumber = `PA-${currentYear}-${String(nextCount).padStart(5, '0')}`;

            // Update លេខរៀង
            transaction.set(counterRef, { count: nextCount, year: currentYear }, { merge: true });
            
            // បញ្ចូលទិន្នន័យ Order
            transaction.set(newOrderRef, {
                orderNumber: orderNumber,
                customerId: customerId,
                productDetails: productDetails,
                status: "New",
                createdAt: serverTimestamp()
            });

            return orderNumber;
        });
    } catch (error) {
        console.error("Transaction Error: ", error);
        throw new Error("បរាជ័យក្នុងការបង្កើតលេខ Order សុវត្ថិភាព");
    }
}

// មុខងារទាញយកបញ្ជី Orders ទាំងអស់
export async function getAllOrders() {
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const orders = [];
        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        return orders;
    } catch (error) {
        console.error("Fetch Orders Error: ", error);
        throw error;
    }
}