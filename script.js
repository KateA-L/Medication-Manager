let medications = [];
let medicationLog = [];
let symptoms = [];
let reminders = [];

/*
function showSection(sectionId) {
    document.querySelectorAll('.hub-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');

    // Highlight active navigation tab
    document.querySelectorAll('.navbar a').forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`.navbar a[href*="${sectionId}"]`);
    if (activeLink) activeLink.classList.add('active');

    if (sectionId === 'dashboard') updateDashboardStats();
}
*/

// Load data on startup
documen.addEventListener("DOMContentLoaded", () => {
    loadData();
    renderMedicationList();
    renderMedicationLog();
    checkMidnight();
});

// Add medication to list
function addMedication() {
    const name = document.getElementById('medName').value.trim();
    const dose = document.getElementById('medDose').value.trim();
    const timeframe = document.getElementById('medTimeframe').value;
    const time = document.getElementById('medTime').value;
    const frequency = parseInt(document.getElementById('medFrequency').value) 
    
    if (name && dose && time && frequency > 0) {
        medications.push({ name, dose, timeframe, time, frequency, taken: false });
        saveData();  // Save after adding medication
        renderMedicationList();

        // Clear input fields
        document.getElementById('medName').value = '';
        document.getElementById('medDose').value = '';
        document.getElementById('medTime').value = '';
        document.getElementById('medFrequency').value = 1;
    } else {
        alert("Please fill in all fields");
    }
}

// Render the medication list including remove button
function renderMedicationList() {
    const medicationList = document.getElementById('medicationList');
    medicationList.innerHTML = ''; // Clear existing list

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
}

// Remove medication
function removeMedication(index) {
    medications.splice(index, 1);
    saveData();
    renderMedicationList();
    updateDashboardStats(); // Ensure dashboard updates after removal
}



// Mark medication as taken
function markAsTaken(index) {
    medications[index].taken = true;
    saveData();
    renderMedicationList();
    updateDashboardStats();
}

// Log symptom
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

// Set reminder
function setReminder() {
    const reminderText = prompt("Enter your reminder:");
    if (reminderText) {
        reminders.push(reminderText);
        saveData();
        updateDashboardStats();
    }
}

// Update the stats on the dashboard
function updateDashboardStats() {
    // Medication adherence progress
    const totalMedications = medications.length;
    const takenMedications = medications.filter(med => med.taken).length;
    const adherencePercentage = totalMedications === 0 ? 0 : (takenMedications / totalMedications) * 100;
    
    document.getElementById('adherenceProgress').style.width = `${adherencePercentage}%`;
    document.getElementById('adherenceText').textContent = `${adherencePercentage.toFixed(0)}% of medications taken`;
    
    // Update symptom count
    document.getElementById('symptomCount').textContent = `Symptoms logged: ${symptoms.length}`;

    // Update upcoming reminders **only if necessary**
    const upcomingRemindersList = document.getElementById('upcomingRemindersList');
    upcomingRemindersList.innerHTML = ''; 

    reminders.forEach(reminder => {
        const li = document.createElement('li');
        li.textContent = reminder;
        upcomingRemindersList.appendChild(li);
    });

    saveData();
}

// Save data using local storage
function saveData() {
    localStorage.setItem('medications', JSON.stringify(medications));
    localStorage.setItem('symptoms', JSON.stringify(symptoms));
    localStorage.setItem('reminders', JSON.stringify(reminders));
    localStorage.setItem('medications', JSON.stringify(medications));
}

// Load data from local storage
function loadData() {
    const storedMedications = localStorage.getItem('medications');
    const storedSymptoms = localStorage.getItem('symptoms');
    const storedReminders = localStorage.getItem('reminders');

    if (storedMedications) medications = JSON.parse(storedMedications);
    if (storedSymptoms) symptoms = JSON.parse(storedSymptoms);
    if (storedReminders) reminders = JSON.parse(storedReminders);
}

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
    loadData();  // Load saved data
    renderMedicationList();  // Show medications on load
    updateDashboardStats();  // Refresh dashboard stats
    showSection('dashboard');  // Default section
});
