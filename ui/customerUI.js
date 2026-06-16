import { createCustomer, getAllCustomers } from '../services/customerService.js';

export function renderCustomerModule(container) {
    // គូរ UI ដោយប្រើ Tailwind
    container.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 class="text-xl font-bold mb-4 border-b pb-2">បញ្ជីអតិថិជន (Customer CRM)</h2>
            
            <form id="customerForm" class="space-y-4 mb-8 bg-gray-50 p-4 rounded border">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-bold mb-1">ឈ្មោះអតិថិជន</label>
                        <input type="text" id="custName" class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required>
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">លេខទូរស័ព្ទ / តេឡេក្រាម</label>
                        <input type="text" id="custPhone" class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required>
                    </div>
                </div>
                <button type="submit" id="btnSaveCustomer" class="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition w-full md:w-auto">
                    រក្សាទុកអតិថិជនថ្មី
                </button>
                <p id="custFormStatus" class="text-sm font-bold mt-2"></p>
            </form>

            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-100 text-gray-700">
                            <th class="p-3 border-b font-bold">លេខសម្គាល់ (ID)</th>
                            <th class="p-3 border-b font-bold">ឈ្មោះ</th>
                            <th class="p-3 border-b font-bold">ទំនាក់ទំនង</th>
                        </tr>
                    </thead>
                    <tbody id="customerTableBody">
                        <tr><td colspan="3" class="p-3 text-center text-gray-500 animate-pulse">កំពុងទាញយកទិន្នន័យអតិថិជន...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // ហៅមុខងារភ្ជាប់ Events និងទាញទិន្នន័យ
    attachEventListeners();
    loadAndDisplayCustomers();
}

function attachEventListeners() {
    const form = document.getElementById('customerForm');
    const statusText = document.getElementById('custFormStatus');
    const btnSave = document.getElementById('btnSaveCustomer');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        btnSave.disabled = true;
        btnSave.classList.add('opacity-50', 'cursor-not-allowed');
        statusText.className = "text-sm font-bold mt-2 text-blue-600";
        statusText.innerText = "កំពុងរក្សាទុកទៅកាន់ Firestore...";

        const data = {
            name: document.getElementById('custName').value.trim(),
            phone: document.getElementById('custPhone').value.trim()
        };

        try {
            await createCustomer(data);
            statusText.className = "text-sm font-bold mt-2 text-green-600";
            statusText.innerText = "✅ រក្សាទុកបានជោគជ័យ!";
            form.reset();
            loadAndDisplayCustomers(); // ទាញយកទិន្នន័យមកបង្ហាញឡើងវិញភ្លាមៗ
        } catch (error) {
            statusText.className = "text-sm font-bold mt-2 text-red-600";
            statusText.innerText = "❌ បរាជ័យ: " + error.message;
        } finally {
            btnSave.disabled = false;
            btnSave.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });
}

async function loadAndDisplayCustomers() {
    const tbody = document.getElementById('customerTableBody');
    try {
        const customers = await getAllCustomers();
        
        if (customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="p-3 text-center text-gray-500">មិនទាន់មានទិន្នន័យអតិថិជននៅឡើយទេ</td></tr>';
            return;
        }
        
        // Render ទិន្នន័យបញ្ចូលទៅក្នុង Table
        tbody.innerHTML = customers.map(cust => `
            <tr class="hover:bg-gray-50 border-b">
                <td class="p-3 text-xs text-gray-400 font-mono">${cust.id}</td>
                <td class="p-3 font-bold text-gray-800">${cust.name}</td>
                <td class="p-3 text-gray-600">${cust.phone}</td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="3" class="p-3 text-center text-red-500 font-bold">បរាជ័យក្នុងការទាញយកទិន្នន័យ: ${error.message}</td></tr>`;
    }
}