// semester.js
document.addEventListener('DOMContentLoaded', function() {

    const urlParams = new URLSearchParams(window.location.search);
    const year = urlParams.get('year') || '1';
    const semester = urlParams.get('sem') || 'first';
    const storageKey = `${year}-${semester}`;
    
    // update semester indicator
    const semText = semester === 'first' ? '1st sem' : '2nd sem';
    document.getElementById('semesterIndicator').textContent = `Year ${year} · ${semText}`;
    
    const coursesContainer = document.getElementById('coursesContainer');
    let courseCount = 0;
    
    // grade options
    const grades = ['A', 'B', 'C', 'D', 'E', 'F'];
    const gradePoints = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0 };
    
    //LOAD SAVED COURSES 
    function loadSavedCourses() {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            const semesterData = JSON.parse(saved);
            return semesterData.courses || [];
        }
        return [];
    }
    
    // CREATE COURSE ROW 
    function createCourseRow(courseData = { name: '', unit: '3', grade: 'A' }) {
        courseCount++;
        
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row g-2 course-row';
        rowDiv.dataset.rowId = courseCount;
        
        // course input 
        const courseCol = document.createElement('div');
        courseCol.className = 'col-5';
        const courseInput = document.createElement('input');
        courseInput.type = 'text';
        courseInput.className = 'form-control rounded-0 border sharp-input course-input';
        courseInput.placeholder = 'e.g., MTH101';
        courseInput.value = courseData.name || '';
        courseCol.appendChild(courseInput);
        
        // unit dropdown 
        const unitCol = document.createElement('div');
        unitCol.className = 'col-3';
        const unitSelect = document.createElement('select');
        unitSelect.className = 'form-select rounded-0 border sharp-input unit-select';
        for (let i = 1; i <= 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i == (courseData.unit || 3)) option.selected = true;
            unitSelect.appendChild(option);
        }
        unitCol.appendChild(unitSelect);
        
        // grade dropdown 
        const gradeCol = document.createElement('div');
        gradeCol.className = 'col-4';
        const gradeSelect = document.createElement('select');
        gradeSelect.className = 'form-select rounded-0 border sharp-input grade-select';
        grades.forEach(g => {
            const option = document.createElement('option');
            option.value = g;
            option.textContent = g;
            if (g === (courseData.grade || 'A')) option.selected = true;
            gradeSelect.appendChild(option);
        });
        gradeCol.appendChild(gradeSelect);
        
        // assemble row
        rowDiv.appendChild(courseCol);
        rowDiv.appendChild(unitCol);
        rowDiv.appendChild(gradeCol);
        
        // add event listeners
        [courseInput, unitSelect, gradeSelect].forEach(el => {
            if (el.tagName === 'INPUT') {
                el.addEventListener('input', function() {
                    saveToLocalStorage();
                    calculateSemesterGPA();
                });
            } else {
                el.addEventListener('change', function() {
                    saveToLocalStorage();
                    calculateSemesterGPA();
                });
            }
        });
        
        return rowDiv;
    }
    
    //SAVE TO LOCALSTORAGE 
    function saveToLocalStorage() {
        const rows = document.querySelectorAll('.course-row');
        const courses = [];
        
        rows.forEach(row => {
            const courseInput = row.querySelector('.course-input');
            const unitSelect = row.querySelector('.unit-select');
            const gradeSelect = row.querySelector('.grade-select');
            
            if (courseInput && unitSelect && gradeSelect) {
                courses.push({
                    name: courseInput.value,
                    unit: unitSelect.value,
                    grade: gradeSelect.value
                });
            }
        });
        
        const semesterData = {
            year: parseInt(year),
            semester: semester,
            courses: courses,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem(storageKey, JSON.stringify(semesterData));
    }
    
    // CALCULATE SEMESTER GPA 
    function calculateSemesterGPA() {
        const rows = document.querySelectorAll('.course-row');
        let totalPoints = 0;
        let totalUnits = 0;
        
        rows.forEach(row => {
            const unitSelect = row.querySelector('.unit-select');
            const gradeSelect = row.querySelector('.grade-select');
            
            if (unitSelect && gradeSelect) {
                const unit = parseFloat(unitSelect.value) || 0;
                const grade = gradeSelect.value;
                const point = gradePoints[grade] || 0;
                
                totalPoints += unit * point;
                totalUnits += unit;
            }
        });
        
        const semesterGPA = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : '0.00';
        document.getElementById('semesterGPA').textContent = semesterGPA;
        document.getElementById('totalCredits').textContent = totalUnits;
        document.getElementById('cgpaDisplay').textContent = semesterGPA;
        
        // save after calculation
        saveToLocalStorage();
    }
    
 
    
    // load saved courses
    const savedCourses = loadSavedCourses();
    
    if (savedCourses.length > 0) {
        // load saved courses
        savedCourses.forEach(course => {
            coursesContainer.appendChild(createCourseRow(course));
        });
    } else {
        // add 3 default courses
        coursesContainer.appendChild(createCourseRow({ name: 'MTH101', unit: '3', grade: 'A' }));
        coursesContainer.appendChild(createCourseRow({ name: 'PHY101', unit: '3', grade: 'B' }));
        coursesContainer.appendChild(createCourseRow({ name: 'CHM101', unit: '2', grade: 'A' }));
    }
    
    // add course button
    document.getElementById('addCourseBtn').addEventListener('click', function() {
        coursesContainer.appendChild(createCourseRow({ name: '', unit: '3', grade: 'A' }));
        calculateSemesterGPA();
    });
    
    // initial calculation
    calculateSemesterGPA();
});