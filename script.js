let medications = [];
let symptoms = [];
let reminders = [];

//Use AES-GCM encryption to protect stored data
//generate secure encryption key
async function getKey() {
    if (!window.encryptionKey) {
        const rawKey = await crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
        window.encryptionKey = rawKey;
    }
    return window.encryptionKey;
}

//encrypt data
async function encryptData(data) {
    const key = await getKey;
    const encodedData = new TextEncoder().encode(JSON.stringify(data));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encodedData,
    );
    return {
        encrypted: btoa(String.fromCharCode(...new Uint8Array(encryptData))),
        iv: btoa(String.fromCharCode(...iv))
    };
}

//decrypt data
async function decryptData(encryptedData, iv) {
    try {
        const key = await getKey();
        const encryptedBytes = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
        const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
        const decryptedData = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: ivBytes },
            key,
            encryptedBytes
        );
        return JSON.parse(new TextDecoder().decode(decryptedData));
    } catch (e) {
        console.warn("Failed to decrypt data");
        return null;
    }  
}

//save encrypted data
async function saveData() {
    localStorage.setItem("medications", JSON.stringify(await encryptData(medications)));
    localStorage.setItem("symptoms", JSON.stringify(await encryptData(symptoms)));
    localStorage.setItem("reminders", JSON.stringify(await encryptData(reminders)));
}

//load data securely
async function loadData() {
    const medData = JSON.parse(localStorage.getItem("medications"));
    const sympData = JSON.parse(localStorage.getItem("symptoms"));
    const remData = JSON.parse(localStorage.getItem("reminders"));

    medications = medData ? await decryptData(medData.encrypted, medData.iv) || [] : [];
    symptoms = sympData ? await decryptData(sympData.encrypted, sympData.iv) || [] : [];
    reminders = remData ? await decryptData(remData.encrypted, remData.iv) || [] : [];

    renderMedicationList();
    renderReminders();
    updateDashboardStats();
}

//prevent malicious script injections into localStorage
function sanitiseInput(input) {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Function to Show Sections
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(sec => sec.classList.remove('active'));
    
    // Show the selected section
    document.getElementById(sectionId).classList.add('active');

    // Highlight the active tab in the sidebar
    document.querySelectorAll('.sidebar li').forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar li[data-section="${sectionId}"]`);
    if (activeLink) activeLink.classList.add('active');
}

// Ensure DOM is fully loaded before executing functions
document.addEventListener("DOMContentLoaded", () => {
    loadData();
    renderMedicationList();
    updateDashboardStats();
    renderReminders();
    checkReminders(); // Check reminders in background
    showSection('overview'); // Default section

    // Attach click events to navbar items
    document.querySelectorAll('.sidebar li').forEach(item => {
        item.addEventListener("click", function () {
            let section = this.getAttribute("data-section");
            showSection(section);
        });
    });
});

// Add reminder with time and notification
function setReminder(){
    const reminderText = sanitiseInput(document.getElementById('reminderText').value.trim());
    const reminderTime = document.getElementById('reminderTime').value;

    if (reminderText && reminderTime) {
        const reminder = {
            text: reminderText,
            time: reminderTime,
            completed: false
        };
        reminders.push(reminder);
        saveData();
        renderReminders();
        scheduleReminder(reminder);
    } else {
        alert("Please enter a reminder and set a time.")
    }
}

// Schedule reminder notification
function scheduleReminder(reminder) {
    const now = new Date();
    const reminderDate = new Date();
    const [hours, minutes] = reminder.time.split(":").map(Number);
    reminderDate.setHours(hours, minutes, 0, 0);

    const timeDifference = reminderDate - now;
    if (timeDifference > 0) {
        setTimeout(() => {
            showNotification(reminder.text);
        }, timeDifference);
    }
}

// Show Notification
function showNotification(message) {
    if (Notification.permission === "granted") {
        new Notification("Reminder", { body: message });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("Reminder", { body: message });
            }
        });
    }
}

// Mark Reminder as Complete
function markReminder(index) {
    if(reminders[index]) {
        reminders[index].completed = true;
        saveData();
        renderReminders();
    }
}

// Remove Reminder
function removeReminder(index) {
    reminders.splice(index, 1);
    saveData();
    renderReminders();
}

// Render Reminders
function renderReminders() {
    const reminderList = document.getElementById('reminderList');
    reminderList.innerHTML = '';

    reminders.forEach((reminder, index) => {
        const li = document.createElement('li');
        li.className = `reminder-item ${reminder.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <strong>${reminder.text}</strong> - <span>${reminder.time}</span>
            <button onclick="markReminder(${index})" ${reminder.completed ? 'disabled' : ''}>
                ${reminder.completed ? '✔ Done' : 'Mark as Done'}
            </button>
            <button onclick="removeReminder(${index})">🗑 Remove</button>
        `;
        reminderList.appendChild(li);
    });
}

// Check in Background for Upcoming Reminders
function checkReminders() {
    setInterval(() => {
        const now = new Date();
        reminders.forEach(reminder => {
            const reminderDate = new Date();
            const [hours, minutes] = reminder.time.split(":").map(Number);
            reminderDate.setHours(hours, minutes, 0, 0);

            if (!reminder.completed && Math.abs(reminderDate - now) < 60000) {
                showNotification(reminder.text);
            }
        });
    }, 30000); // Check every 30 seconds
}


// Add Medication
function addMedication() {
    const name = sanitiseInput(document.getElementById('medName').value.trim());
    const dose = sanitiseInput(document.getElementById('medDose').value.trim());
    const timeframe = sanitiseInput(document.getElementById('medTimeframe').value);
    const time = document.getElementById('medTime').value;
    const frequency = parseInt(document.getElementById('medFrequency').value);
    
    if (name && dose && time && frequency > 0) {
        medications.push({ name, dose, timeframe, time, frequency, taken: false });

        //clear form fields
        document.getElementById('medName').value = '';
        document.getElementById('medDose').value = '';
        document.getElementById('medTime').value = '';
        document.getElementById('medFrequency').value = 1;

        saveData();
        renderMedicationList();
    } else {
        alert("Please fill in all fields");
    }
    updateDashboardStats();
}

// Render Medications
function renderMedicationList() {
    const medicationList = document.getElementById('medicationList');
    medicationList.innerHTML = '';

    medications.forEach((med, index) => {
        const medItem = document.createElement('div');
        medItem.className = 'medication-item';

        medItem.innerHTML = `
            <div>
                <strong>${med.name}</strong> - ${med.dose}<br>
                <small>${med.timeframe} at ${med.time} (${med.frequency}x per day)</small>
            </div>
            <button onclick="markAsTaken(${index})">${med.taken ? '✔ Taken' : 'Mark as Taken'}</button>
            <button onclick="removeMedication(${index})">🗑 Remove</button>
        `;
        medicationList.appendChild(medItem);
    });
    saveData();
    updateDashboardStats();
}

// Remove Medication
function removeMedication(index) {
    medications.splice(index, 1);
    saveData();
    renderMedicationList();
    updateDashboardStats();
}

// Mark as Taken
function markAsTaken(index) {
    medications[index].taken = true;
    saveData();
    renderMedicationList();
    updateDashboardStats();
}

// Log Symptoms
function logSymptom() {
    const symptom = document.getElementById('symptomText').value.trim();
    
    if (symptom) {
        symptoms.push(symptom);
        saveData();
        document.getElementById('symptomText').value = '';
        updateDashboardStats();
    } else {
        alert("Please log a symptom.");
    }
}

// Update Dashboard Stats
function updateDashboardStats() {
    const totalMedications = medications.length;
    const takenMedications = medications.filter(med => med.taken).length;
    const adherencePercentage = totalMedications === 0 ? 0 : (takenMedications / totalMedications) * 100;
    
    document.getElementById('medCount').textContent = totalMedications;
    document.getElementById('adherenceProgress').style.width = `${adherencePercentage}%`;
    document.getElementById('adherenceText').textContent = `${adherencePercentage.toFixed(0)}% of medications taken`;
    
    // Update active medications list
    const activeMedicationsList = document.getElementById('activeMedicationsList');
    activeMedicationsList.innerHTML = '';

    medications.forEach(med => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${med.name}</strong> - ${med.dose} <br>
            <small>${med.timeframe} at ${med.time} (${med.frequency}x per day)</small> <br>
            <span style = "color: ${med.taken ? 'green' : 'red'}">
                ${med.taken ? '✔ Taken' : '❌ Not Taken'} 
            </span>
        `;
        activeMedicationsList.appendChild(li);
    })


    document.getElementById('symptomList').innerHTML = symptoms.map(symptom => `<li>${symptom}</li>`).join('');
    
    const reminderList = document.getElementById('reminderList');
    reminderList.innerHTML = ''; 
    reminders.forEach(reminder => {
        const li = document.createElement('li');
        li.textContent = reminder;
        reminderList.appendChild(li);
    });

    saveData();
}

// Save Data
function saveData() {
    localStorage.setItem('medications', JSON.stringify(medications));
    localStorage.setItem('symptoms', JSON.stringify(symptoms));
    localStorage.setItem('reminders', JSON.stringify(reminders));
}

// Load Data
function loadData() {
    medications = JSON.parse(localStorage.getItem('medications')) || [];
    symptoms = JSON.parse(localStorage.getItem('symptoms')) || [];
    reminders = JSON.parse(localStorage.getItem('reminders')) || [];

    renderMedicationList();
    renderReminders();
    updateDashboardStats();
}
