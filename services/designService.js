import { db } from '../firebase-config.js';
import { collection, addDoc, doc, updateDoc, runTransaction, serverTimestamp, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ១. បង្កើតគម្រោងរចនាថ្មី (Design Job) ដោយភ្ជាប់តែជាមួយអតិថិជន មិនទាន់មាន Order
export async function createDesignJob(customerId, requirements) {
    try {
        const docRef = await addDoc(collection(db, "designs"), {
            customerId: customerId,
            requirements: requirements, // ឧ. "ចង់បានកាតពណ៌ខ្មៅ រចនាបថ Minimalist"
            status: "Drafting", // Drafting, Reviewing, Approved
            previewFiles: [],
            finalPrintFiles: [],
            linkedOrderId: null, // នៅទទេរហូតដល់ភ្ញៀវបញ្ជាក់ចំនួន
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("បរាជ័យក្នុងការបង្កើត Design Job: ", error);
        throw new Error("មិនអាចបង្កើតកំណត់ត្រារចនាបានទេ");
    }
}

// ២. អាប់ដេតឯកសារ និងស្ថានភាពនៅពេល Designer ធ្វើការ
export async function updateDesignFiles(designId, fileUrls, type = 'preview') {
    const designRef = doc(db, "designs", designId);
    try {
        const updateData = type === 'preview' 
            ? { previewFiles: fileUrls, status: "Reviewing" }
            : { finalPrintFiles: fileUrls };
            
        await updateDoc(designRef, updateData);
        return true;
    } catch (error) {
        console.error("Update Design Error: ", error);
        throw error;
    }
}

// ៣. បំប្លែង Design ដែលភ្ញៀវពេញចិត្ត ទៅជា Order ជាក់ស្តែង (Checkout)
export async function convertDesignToOrder(designId, customerId, orderDetails) {
    const currentYear = new Date().getFullYear();
    const counterRef = doc(db, "systemMetadata", "orderCounter");
    const newOrderRef = doc(collection(db, "orders"));
    const designRef = doc(db, "designs", designId);

    try {
        return await runTransaction(db, async (transaction) => {
            // ទាញយកលេខរៀង Order
            const counterDoc = await transaction.get(counterRef);
            let currentCount = counterDoc.exists() && counterDoc.data().year === currentYear ? counterDoc.data().count : 0;
            const nextCount = currentCount + 1;
            const orderNumber = `PA-${currentYear}-${String(nextCount).padStart(5, '0')}`;

            // ១. អាប់ដេតលេខរៀង
            transaction.set(counterRef, { count: nextCount, year: currentYear }, { merge: true });
            
            // ២. បង្កើត Order ដែលមានបរិមាណជាក់ស្តែង
            transaction.set(newOrderRef, {
                orderNumber: orderNumber,
                customerId: customerId,
                designId: designId,
                items: orderDetails.items, // ឧ. [{ name: "កាត", qty: 5 }, { name: "ត្រា", qty: 1 }]
                totalPrice: orderDetails.totalPrice,
                status: "Ready for Print", // រំលងវគ្គ Design ព្រោះធ្វើរួចហើយ
                createdAt: serverTimestamp()
            });

            // ៣. ចាក់សោរ Design ភ្ជាប់ជាមួយ Order នេះ
            transaction.update(designRef, {
                status: "Approved",
                linkedOrderId: newOrderRef.id
            });

            return orderNumber;
        });
    } catch (error) {
        console.error("Conversion Error: ", error);
        throw new Error("បរាជ័យក្នុងការបំប្លែង Design ទៅជា Order");
    }
}