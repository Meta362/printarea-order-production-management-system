import { db } from './firebase-config.js';
import { renderCustomerModule } from './ui/customerUI.js';
import { renderOrderModule } from './ui/orderUI.js';
import { renderDesignModule } from './ui/designUI.js';


document.addEventListener('DOMContentLoaded', () => {
    console.log("System Status: Architecture Booted.");
    console.log("Database Link:", db ? "Active" : "Failed");

    const mainContent = document.getElementById('main-content');
    const headerTitle = document.getElementById('headerTitle');
    const navLinks = document.querySelectorAll('#sidebarNav a');

    // ប្រព័ន្ធ Routing ដ៏សាមញ្ញ ប៉ុន្តែរឹងមាំ
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // ដក Active state ពីចាស់
            navLinks.forEach(l => l.classList.remove('bg-gray-800'));
            // ដាក់ Active state ទៅថ្មី
            e.target.classList.add('bg-gray-800');

            const targetModule = e.target.getAttribute('data-target');
            
            // Logic ហៅ Module មកបង្ហាញ (អ្នកនឹងបង្រៀន AI ឱ្យសរសេរកន្លែងនេះ)
            loadModule(targetModule, mainContent, headerTitle);
        });
    });
});

function loadModule(moduleName, container, header) {
    container.innerHTML = '<div class="p-4 flex justify-center"><div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>';
    
    setTimeout(() => {
        switch(moduleName) {
            case 'dashboard':
                header.innerText = "Dashboard ទូទៅ";
                container.innerHTML = `<div class="p-4 bg-green-100 text-green-800 rounded font-bold border border-green-300">ទិដ្ឋភាព Dashboard នឹងបង្ហាញនៅទីនេះ</div>`;
                break;
            case 'customer':
                header.innerText = "គ្រប់គ្រងអតិថិជន (CRM)";
                renderCustomerModule(container);
                break;
            case 'order':
                header.innerText = "គ្រប់គ្រងការបញ្ជាទិញ (Orders)";
                // ២. ហៅ Function គូរ UI សម្រាប់ Order នៅទីនេះ
                renderOrderModule(container);
                break;
            case 'design':
                console.log("បានរត់ចូល case 'design' ហើយ!"); // +++ ដាក់បន្ទាត់នេះ
                header.innerText = "គ្រប់គ្រងការរចនា (Design & Files)";
                
                try {
                    renderDesignModule(container); 
                    console.log("គូរ UI រួចរាល់!"); // +++ ដាក់បន្ទាត់នេះ
                } catch (error) {
                    console.error("មានបញ្ហានៅពេលហៅ renderDesignModule:", error); // +++ ដាក់បន្ទាត់នេះដើម្បីចាប់ Error ដែលអាចលាក់ខ្លួន
                }
                break;
        }
    }, 150);
}