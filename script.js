let medications = [];
let symptoms = [];
let reminders = [];

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
    showSection('overview'); // Default section

    // Attach click events to navbar items
    document.querySelectorAll('.sidebar li').forEach(item => {
        item.addEventListener("click", function () {
            let section = this.getAttribute("data-section");
            showSection(section);
        });
    });
});

// Add Medication
function addMedication() {
    const name = document.getElementById('medName').value.trim();
    const dose = document.getElementById('medDose').value.trim();
    const timeframe = document.getElementById('medTimeframe').value;
    const time = document.getElementById('medTime').value;
    const frequency = parseInt(document.getElementById('medFrequency').value);
    
    if (name && dose && time && frequency > 0) {
        medications.push({ name, dose, timeframe, time, frequency, taken: false });
        saveData();
        renderMedicationList();
        document.getElementById('medName').value = '';
        document.getElementById('medDose').value = '';
        document.getElementById('medTime').value = '';
        document.getElementById('medFrequency').value = 1;
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

// Set Reminder
function setReminder() {
    const reminderText = prompt("Enter your reminder:");
    if (reminderText) {
        reminders.push(reminderText);
        saveData();
        updateDashboardStats();
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
}
