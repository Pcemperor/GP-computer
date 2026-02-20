// settings.js - manage app preferences

document.addEventListener('DOMContentLoaded', function() {
    
    // ========== LOAD SAVED SETTINGS ==========
    function loadSettings() {
        const settings = localStorage.getItem('appSettings');
        if (settings) {
            return JSON.parse(settings);
        }
        return {
            gradingScale: '5point',
            minCredit: 1,
            maxCredit: 6,
            defaultGrade: 'B'
        };
    }
    
    // ========== SAVE SETTINGS ==========
    function saveSettings(settings) {
        localStorage.setItem('appSettings', JSON.stringify(settings));
        // show saved indicator
        const toast = document.createElement('div');
        toast.className = 'bg-success text-white px-4 py-2 position-fixed bottom-0 end-0 m-3';
        toast.textContent = 'settings saved ✓';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }
    
    // ========== APPLY SETTINGS TO FORM ==========
    function applySettingsToForm(settings) {
        // grading scale radio
        document.querySelector(`input[name="gradingScale"][value="${settings.gradingScale}"]`).checked = true;
        
        // credit range
        document.getElementById('minCredit').value = settings.minCredit;
        document.getElementById('maxCredit').value = settings.maxCredit;
        
        // default grade
        document.getElementById('defaultGrade').value = settings.defaultGrade;
    }
    
    //  GET SETTINGS FROM FORM 
    function getSettingsFromForm() {
        return {
            gradingScale: document.querySelector('input[name="gradingScale"]:checked').value,
            minCredit: parseInt(document.getElementById('minCredit').value) || 1,
            maxCredit: parseInt(document.getElementById('maxCredit').value) || 6,
            defaultGrade: document.getElementById('defaultGrade').value
        };
    }
    
    // UPDATE CGPA DISPLAY
    function updateCGPA() {
        // calculate CGPA from all semesters
        const gradePoints = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0 };
        let totalPoints = 0;
        let totalUnits = 0;
        
        for (let year = 1; year <= 10; year++) {
            for (let sem of ['first', 'second']) {
                const key = `${year}-${sem}`;
                const saved = localStorage.getItem(key);
                if (saved) {
                    const semesterData = JSON.parse(saved);
                    if (semesterData.courses) {
                        semesterData.courses.forEach(course => {
                            const unit = parseFloat(course.unit) || 0;
                            const point = gradePoints[course.grade] || 0;
                            totalPoints += unit * point;
                            totalUnits += unit;
                        });
                    }
                }
            }
        }
        
        const cgpa = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : '0.00';
        document.getElementById('cgpaDisplay').textContent = cgpa;
        if (document.getElementById('menuCGPA')) {
            document.getElementById('menuCGPA').textContent = `overall cgpa: ${cgpa}`;
        }
    }
    
    // EXPORT DATA

    function exportData() {
        const allData = {};
        
        // get all semester data
        for (let year = 1; year <= 10; year++) {
            for (let sem of ['first', 'second']) {
                const key = `${year}-${sem}`;
                const saved = localStorage.getItem(key);
                if (saved) {
                    allData[key] = JSON.parse(saved);
                }
            }
        }
        
        // get settings
        allData.appSettings = getSettingsFromForm();
        
        // create download
        const dataStr = JSON.stringify(allData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `gpcalc-backup-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    // IMPORT DATA 
    function importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const imported = JSON.parse(e.target.result);
                    
                    // confirm before overwriting
                    if (confirm('This will overwrite all current data. Continue?')) {
                        // clear existing semester data
                        for (let year = 1; year <= 10; year++) {
                            for (let sem of ['first', 'second']) {
                                const key = `${year}-${sem}`;
                                localStorage.removeItem(key);
                            }
                        }
                        
                        // import new data
                        Object.keys(imported).forEach(key => {
                            if (key !== 'appSettings') {
                                localStorage.setItem(key, JSON.stringify(imported[key]));
                            }
                        });
                        
                        // import settings if present
                        if (imported.appSettings) {
                            localStorage.setItem('appSettings', JSON.stringify(imported.appSettings));
                            applySettingsToForm(imported.appSettings);
                        }
                        
                        alert('Data imported successfully!');
                        updateCGPA();
                    }
                } catch (error) {
                    alert('Invalid backup file');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    // ========== RESET ALL DATA ==========
    function resetData() {
        if (confirm(' This will delete ALL your courses and GPA data. This cannot be undone. Continue?')) {
            // clear all semester data
            for (let year = 1; year <= 10; year++) {
                for (let sem of ['first', 'second']) {
                    const key = `${year}-${sem}`;
                    localStorage.removeItem(key);
                }
            }
            
            // reset settings to default
            const defaultSettings = {
                gradingScale: '5point',
                minCredit: 1,
                maxCredit: 6,
                defaultGrade: 'B'
            };
            localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
            applySettingsToForm(defaultSettings);
            
            alert('All data has been reset');
            updateCGPA();
        }
    }
    
    // INIT
    const settings = loadSettings();
    applySettingsToForm(settings);
    updateCGPA();
    
    // ========== EVENT LISTENERS ==========
    
    // auto-save on any change
    document.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('change', function() {
            const currentSettings = getSettingsFromForm();
            saveSettings(currentSettings);
            
            // TODO: propagate settings to other pages
            // (we'll handle this in a future update)
        });
    });
    
    // manual save buttons
    document.getElementById('exportData').addEventListener('click', exportData);
    document.getElementById('importData').addEventListener('click', importData);
    document.getElementById('resetData').addEventListener('click', resetData);
    
    // update menu CGPA when page gains focus
    window.addEventListener('focus', updateCGPA);
});