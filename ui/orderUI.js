import { createSecureOrder, getAllOrders } from '../services/orderService.js';
import { getAllCustomers } from '../services/customerService.js';

export async function renderOrderModule(container) {
    // បង្ហាញ Loading សិន ខណៈពេលកំពុងទាញយកទិន្នន័យអតិថិជន
    container.innerHTML = '<div class="text-center p-10"><div class="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div><p class="mt-2 text-gray-500 font-bold">កំពុងរៀបចំប្រព័ន្ធបញ្ជាទិញ...</p></div>';

    let customerOptions = '<option value="">-- សូមជ្រើសរើសអតិថិជន --</option>';
    
    try {
        // CROSS-MODULE CALL: ទាញទិន្នន័យពី Customer Module
        const customers = await getAllCustomers();
        customers.forEach(c => {
            customerOptions += `<option value="${c.id}">${c.name} (${c.phone})</option>`;
        });
    } catch (error) {
        customerOptions = '<option value="">បរាជ័យក្នុងការទាញយកទិន្នន័យអតិថិជន</option>';
    }

    container.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 class="text-xl font-bold mb-4 border-b pb-2">គ្រប់គ្រងការបញ្ជាទិញ (Order Management)</h2>
            
            <form id="orderForm" class="space-y-4 mb-8 bg-purple-50 p-4 rounded border border-purple-100">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-bold mb-1">អតិថិជន <span class="text-red-500">*</span></label>
                        <select id="orderCustomerId" class="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none" required>
                            ${customerOptions}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">ព័ត៌មានលម្អិតផលិតផល <span class="text-red-500">*</span></label>
                        <input type="text" id="orderProduct" placeholder="ឧ. Flash Stamp 30x50mm - ពណ៌ខៀវ" class="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none" required>
                    </div>
                </div>
                <button type="submit" id="btnSaveOrder" class="bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 transition w-full md:w-auto">
                    បង្កើត Order ថ្មី
                </button>
                <p id="orderFormStatus" class="text-sm font-bold mt-2"></p>
            </form>

            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-100 text-gray-700">
                            <th class="p-3 border-b font-bold">លេខ Order</th>
                            <th class="p-3 border-b font-bold">ស្ថានភាព</th>
                            <th class="p-3 border-b font-bold">ផលិតផល</th>
                        </tr>
                    </thead>
                    <tbody id="orderTableBody">
                        <tr><td colspan="3" class="p-3 text-center text-gray-500 animate-pulse">កំពុងទាញយកទិន្នន័យ...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    attachOrderEvents();
    loadAndDisplayOrders();
}

function attachOrderEvents() {
    const form = document.getElementById('orderForm');
    const statusText = document.getElementById('orderFormStatus');
    const btnSave = document.getElementById('btnSaveOrder');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        btnSave.disabled = true;
        btnSave.classList.add('opacity-50', 'cursor-not-allowed');
        statusText.className = "text-sm font-bold mt-2 text-purple-600";
        statusText.innerText = "កំពុងដំណើរការ Transaction...";

        const customerId = document.getElementById('orderCustomerId').value;
        const productDetails = document.getElementById('orderProduct').value.trim();

        try {
            const finalOrderNumber = await createSecureOrder(customerId, productDetails);
            statusText.className = "text-sm font-bold mt-2 text-green-600";
            statusText.innerText = `✅ ជោគជ័យ! លេខសម្គាល់: ${finalOrderNumber}`;
            document.getElementById('orderProduct').value = ''; // Reset តែទម្រង់ទំនិញ
            loadAndDisplayOrders(); // Update តារាង
        } catch (error) {
            statusText.className = "text-sm font-bold mt-2 text-red-600";
            statusText.innerText = "❌ " + error.message;
        } finally {
            btnSave.disabled = false;
            btnSave.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });
}

async function loadAndDisplayOrders() {
    const tbody = document.getElementById('orderTableBody');
    try {
        const orders = await getAllOrders();
        
        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="p-3 text-center text-gray-500">មិនទាន់មានការបញ្ជាទិញនៅឡើយទេ</td></tr>';
            return;
        }
        
        tbody.innerHTML = orders.map(ord => `
            <tr class="hover:bg-gray-50 border-b">
                <td class="p-3 font-bold text-purple-700">${ord.orderNumber}</td>
                <td class="p-3"><span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-bold">${ord.status}</span></td>
                <td class="p-3 text-gray-600">${ord.productDetails}</td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="3" class="p-3 text-center text-red-500 font-bold">បរាជ័យក្នុងការទាញយកទិន្នន័យ</td></tr>`;
    }
}