let medications = [];
let symptoms = [];
let reminders = [];

// Show selected section
function showSection(sectionId) {
    document.querySelectorAll('.hub-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');

    // HIGHLIGHT ACTIVE NAVIGATION TAB
    document.querySelectorAll('.navbar a').forEach(link => link.classList.remove('active'));
    document.querySelector(`.navbar a[href*="${sectionId}"]`).classList.add('active');

    if (sectionId === 'dashboard') updateDashboardStats();
}

// Add medication to list
function addMedication() {
    const name = document.getElementById('medName').value;
    const dose = document.getElementById('medDose').value;
    
    if (name && dose) {
        medications.push({ name, dose, taken: false });
        renderMedicationList();
        document.getElementById('medName').value = '';
        document.getElementById('medDose').value = '';
    } else {
        alert("Please enter both medication name and dosage.");
    }
}

// Render the medication list
function renderMedicationList() {
    const medicationList = document.getElementById('medicationList');
    medicationList.innerHTML = '';
    
    medications.forEach((medication, index) => {
        const medItem = document.createElement('div');
        medItem.classList.add('medication-item');
        medItem.innerHTML = `
            <span>${medication.name} - ${medication.dose}</span>
            <button onclick="markAsTaken(${index})">${medication.taken ? 'Taken' : 'Mark as Taken'}</button>
        `;
        medicationList.appendChild(medItem);
    });
}

//Remove medication
function removeMedication(index) {
    medications.splice(index, 1);
    saveData();
    renderMedicationList();
}


// Mark medication as taken
function markAsTaken(index) {
    medications[index].taken = true;
    renderMedicationList();
    updateDashboardStats();
}

// Log symptom
function logSymptom() {
    const symptom = document.getElementById('symptomText').value;
    
    if (symptom) {
        symptoms.push(symptom);
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
    
    // Upcoming reminders
    const upcomingRemindersList = document.getElementById('upcomingRemindersList');
    upcomingRemindersList.innerHTML = '';
    reminders.forEach(reminder => {
        const li = document.createElement('li');
        li.textContent = reminder;
        upcomingRemindersList.appendChild(li);
    });
}

//Save data using local storage
function saveData() {
    localStorage.setItem('medications', JSON.stringify(medications));
    localStorage.setItem('symptoms', JSON.stringify(symptoms));
}

document.addEventListener('DOMContentLoaded', () => {
    showSection('dashboard');
});
