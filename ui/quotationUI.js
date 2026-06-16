import { createSecureQuotation, getAllQuotations } from '../services/quotationService.js';
import { getAllCustomers } from '../services/customerService.js';

export async function renderQuotationModule(container) {
    // បង្ហាញ Loading សិន ខណៈពេលកំពុងទាញយកទិន្នន័យអតិថិជន
    container.innerHTML = '<div class="text-center p-10"><div class="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div><p class="mt-2 text-gray-500 font-bold">កំពុងរៀបចំប្រព័ន្ធ Quotation...</p></div>';

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
            <h2 class="text-xl font-bold mb-4 border-b pb-2">គ្រប់គ្រងការចេញតម្លៃ (Quotation Management)</h2>
            
            <form id="quotationForm" class="space-y-4 mb-8 bg-blue-50 p-4 rounded border border-blue-100">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-bold mb-1">អតិថិជន <span class="text-red-500">*</span></label>
                        <select id="quotationCustomerId" class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required>
                            ${customerOptions}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">ព័ត៌មានលម្អិតផលិតផល <span class="text-red-500">*</span></label>
                        <input type="text" id="quotationProduct" placeholder="ឧ. បោះពុម្ពនាមប័ណ្ណ 10 ប្រអប់" class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required>
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">តម្លៃសរុប ($) <span class="text-red-500">*</span></label>
                        <input type="number" id="quotationAmount" placeholder="ឧ. 50.00" step="0.01" min="0" class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required>
                    </div>
                </div>
                <button type="submit" id="btnSaveQuotation" class="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition w-full md:w-auto">
                    បង្កើត Quotation ថ្មី
                </button>
                <p id="quotationFormStatus" class="text-sm font-bold mt-2"></p>
            </form>

            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-100 text-gray-700">
                            <th class="p-3 border-b font-bold">លេខ Quotation</th>
                            <th class="p-3 border-b font-bold">ស្ថានភាព</th>
                            <th class="p-3 border-b font-bold">ផលិតផល</th>
                            <th class="p-3 border-b font-bold">តម្លៃសរុប</th>
                        </tr>
                    </thead>
                    <tbody id="quotationTableBody">
                        <tr><td colspan="4" class="p-3 text-center text-gray-500 animate-pulse">កំពុងទាញយកទិន្នន័យ...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    attachQuotationEvents();
    loadAndDisplayQuotations();
}

function attachQuotationEvents() {
    const form = document.getElementById('quotationForm');
    const statusText = document.getElementById('quotationFormStatus');
    const btnSave = document.getElementById('btnSaveQuotation');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        btnSave.disabled = true;
        btnSave.classList.add('opacity-50', 'cursor-not-allowed');
        statusText.className = "text-sm font-bold mt-2 text-blue-600";
        statusText.innerText = "កំពុងដំណើរការ Transaction...";

        const customerId = document.getElementById('quotationCustomerId').value;
        const productDetails = document.getElementById('quotationProduct').value.trim();
        const amount = parseFloat(document.getElementById('quotationAmount').value);

        try {
            const finalQuotationNumber = await createSecureQuotation(customerId, productDetails, amount);
            statusText.className = "text-sm font-bold mt-2 text-green-600";
            statusText.innerText = `✅ ជោគជ័យ! លេខសម្គាល់: ${finalQuotationNumber}`;
            document.getElementById('quotationProduct').value = '';
            document.getElementById('quotationAmount').value = '';
            loadAndDisplayQuotations(); // Update តារាង
        } catch (error) {
            statusText.className = "text-sm font-bold mt-2 text-red-600";
            statusText.innerText = "❌ " + error.message;
        } finally {
            btnSave.disabled = false;
            btnSave.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });
}

async function loadAndDisplayQuotations() {
    const tbody = document.getElementById('quotationTableBody');
    try {
        const quotations = await getAllQuotations();
        
        if (quotations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="p-3 text-center text-gray-500">មិនទាន់មាន Quotation នៅឡើយទេ</td></tr>';
            return;
        }
        
        tbody.innerHTML = quotations.map(q => `
            <tr class="hover:bg-gray-50 border-b">
                <td class="p-3 font-bold text-blue-700">${q.quotationNumber}</td>
                <td class="p-3"><span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-bold">${q.status}</span></td>
                <td class="p-3 text-gray-600">${q.productDetails}</td>
                <td class="p-3 font-bold text-gray-700">$${q.amount.toFixed(2)}</td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-red-500 font-bold">បរាជ័យក្នុងការទាញយកទិន្នន័យ</td></tr>`;
    }
}
