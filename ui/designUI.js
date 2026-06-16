import { createDesignJob } from '../services/designService.js';

export function renderDesignModule(container) {
    container.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 class="text-xl font-bold mb-4">បង្កើតការងាររចនាថ្មី</h2>
            <form id="designForm" class="space-y-4">
                <input type="text" id="custName" placeholder="ឈ្មោះអតិថិជន" class="w-full border p-2 rounded" required>
                <textarea id="reqs" placeholder="តម្រូវការរចនា (ឧ. ត្រាឈ្មោះ, កាតនាមប័ណ្ណ...)" class="w-full border p-2 rounded"></textarea>
                <input type="file" id="designFile" class="w-full border p-2 rounded">
                <button type="submit" class="bg-pink-600 text-white p-2 rounded w-full font-bold">បង្កើតការងារ</button>
            </form>
            <div id="status" class="mt-4 font-bold"></div>
        </div>
    `;

    document.getElementById('designForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('status');
        status.innerText = "កំពុងដំណើរការ...";
        
        try {
            const cust = document.getElementById('custName').value;
            const reqs = document.getElementById('reqs').value;
            const file = document.getElementById('designFile').files[0];
            
            await createDesignJob(cust, reqs, file);
            status.innerText = "ជោគជ័យ! ការងារត្រូវបានបង្កើត។";
        } catch (err) {
            status.innerText = "បរាជ័យ: " + err.message;
        }
    });
}