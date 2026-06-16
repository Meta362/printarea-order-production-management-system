import { db } from '../firebase-config.js';
import { doc, collection, runTransaction, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// មុខងារបង្កើត Quotation ជាមួយប្រព័ន្ធការពារជាន់លេខ (Pessimistic Lock / Atomic Transaction)
export async function createSecureQuotation(customerId, productDetails, amount) {
    const currentYear = new Date().getFullYear();
    const counterRef = doc(db, "systemMetadata", "quotationCounter");
    const newQuotationRef = doc(collection(db, "quotations"));

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
            const quotationNumber = `QT-${currentYear}-${String(nextCount).padStart(5, '0')}`;

            // Update លេខរៀង
            transaction.set(counterRef, { count: nextCount, year: currentYear }, { merge: true });
            
            // បញ្ចូលទិន្នន័យ Quotation
            transaction.set(newQuotationRef, {
                quotationNumber: quotationNumber,
                customerId: customerId,
                productDetails: productDetails,
                amount: amount,
                status: "Pending",
                createdAt: serverTimestamp()
            });

            return quotationNumber;
        });
    } catch (error) {
        console.error("Transaction Error: ", error);
        throw new Error("បរាជ័យក្នុងការបង្កើតលេខ Quotation សុវត្ថិភាព");
    }
}

// មុខងារទាញយកបញ្ជី Quotations ទាំងអស់
export async function getAllQuotations() {
    try {
        const q = query(collection(db, "quotations"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const quotations = [];
        querySnapshot.forEach((doc) => {
            quotations.push({ id: doc.id, ...doc.data() });
        });
        return quotations;
    } catch (error) {
        console.error("Fetch Quotations Error: ", error);
        throw error;
    }
}
