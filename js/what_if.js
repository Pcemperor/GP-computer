// whatif.js - simulate future grades

document.addEventListener('DOMContentLoaded', function() {
    const gradePoints = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0 };
    let courseCount = 0;
    
    // ========== LOAD CURRENT DATA ==========
    function calculateCurrentCGPA() {
        let totalPoints = 0;
        let totalUnits = 0;
        
        for (let year = 1; year <= 10; year++) {
            for (let sem of ['first', 'second']) {
                const key = `${year}-${sem}`;
                const saved = localStorage.getItem(key);
                
                if (saved) {
                    const semesterData = JSON.parse(saved);
                    if (semesterData.courses && semesterData.courses.length > 0) {
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
        
        return {
            cgpa: totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : '0.00',
            totalPoints: totalPoints,
            totalUnits: totalUnits
        };
    }
    
    // ========== POPULATE SEMESTER DROPDOWN ==========
    function populateSemesterDropdown() {
        const select = document.getElementById('semesterSelect');
        
        // add existing semesters
        for (let year = 1; year <= 10; year++) {
            for (let sem of ['first', 'second']) {
                const key = `${year}-${sem}`;
                const saved = localStorage.getItem(key);
                const semText = sem === 'first' ? '1st' : '2nd';
                
                if (saved) {
                    const semesterData = JSON.parse(saved);
                    if (semesterData.courses && semesterData.courses.length > 0) {
                        // semester has data - option to overwrite
                        const option = document.createElement('option');
                        option.value = key;
                        option.textContent = `Year ${year} · ${semText} sem (overwrite)`;
                        select.appendChild(option);
                    } else {
                        // empty semester
                        const option = document.createElement('option');
                        option.value = key;
                        option.textContent = `Year ${year} · ${semText} sem (empty)`;
                        select.appendChild(option);
                    }
                } else {
                    // completely new semester
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = `Year ${year} · ${semText} sem (new)`;
                    select.appendChild(option);
                }
            }
        }
    }
    
    // ========== CREATE COURSE ROW ==========
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
        courseInput.className = 'form-control rounded-0 border sharp-input whatif-course';
        courseInput.placeholder = 'e.g., MTH101';
        courseInput.value = courseData.name || '';
        courseCol.appendChild(courseInput);
        
        // unit dropdown
        const unitCol = document.createElement('div');
        unitCol.className = 'col-3';
        const unitSelect = document.createElement('select');
        unitSelect.className = 'form-select rounded-0 border sharp-input whatif-unit';
        for (let i = 1; i <= 6; i++) {
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
        gradeSelect.className = 'form-select rounded-0 border sharp-input whatif-grade';
        ['A', 'B', 'C', 'D', 'E', 'F'].forEach(g => {
            const option = document.createElement('option');
            option.value = g;
            option.textContent = g;
            if (g === (courseData.grade || 'A')) option.selected = true;
            gradeSelect.appendChild(option);
        });
        gradeCol.appendChild(gradeSelect);
        
        rowDiv.appendChild(courseCol);
        rowDiv.appendChild(unitCol);
        rowDiv.appendChild(gradeCol);
        
        // add event listeners for real-time calculation
        [courseInput, unitSelect, gradeSelect].forEach(el => {
            el.addEventListener('input', calculatePrediction);
            el.addEventListener('change', calculatePrediction);
        });
        
        return rowDiv;
    }
    
    // ========== CALCULATE PREDICTION ==========
    function calculatePrediction() {
        const current = calculateCurrentCGPA();
        document.getElementById('currentCGPA').textContent = current.cgpa;
        document.getElementById('cgpaDisplay').textContent = current.cgpa;
        
        // get hypothetical courses
        const rows = document.querySelectorAll('.course-row');
        let hypoPoints = 0;
        let hypoUnits = 0;
        
        rows.forEach(row => {
            const unitSelect = row.querySelector('.whatif-unit');
            const gradeSelect = row.querySelector('.whatif-grade');
            
            if (unitSelect && gradeSelect) {
                const unit = parseFloat(unitSelect.value) || 0;
                const grade = gradeSelect.value;
                const point = gradePoints[grade] || 0;
                
                hypoPoints += unit * point;
                hypoUnits += unit;
            }
        });
        
        // calculate semester GPA
        const semGPA = hypoUnits > 0 ? (hypoPoints / hypoUnits).toFixed(2) : '0.00';
        document.getElementById('predictedSemGPA').textContent = semGPA;
        
        // calculate new CGPA
        const totalPoints = current.totalPoints + hypoPoints;
        const totalUnits = current.totalUnits + hypoUnits;
        const newCGPA = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : '0.00';
        document.getElementById('predictedCGPA').textContent = newCGPA;
        
        // show change
        const change = (parseFloat(newCGPA) - parseFloat(current.cgpa)).toFixed(2);
        const changeText = change > 0 ? `↑ +${change}` : change < 0 ? `↓ ${change}` : 'no change';
        document.getElementById('cgpaChange').innerHTML = `impact on CGPA: <span class="${change > 0 ? 'text-success' : change < 0 ? 'text-danger' : ''}">${changeText}</span>`;
    }
    
    // ========== LOAD SEMESTER DATA ==========
    function loadSemesterData(semesterKey) {
        const coursesContainer = document.getElementById('whatIfCourses');
        coursesContainer.innerHTML = '';
        courseCount = 0;
        
        if (semesterKey !== 'future') {
            const saved = localStorage.getItem(semesterKey);
            if (saved) {
                const semesterData = JSON.parse(saved);
                if (semesterData.courses && semesterData.courses.length > 0) {
                    semesterData.courses.forEach(course => {
                        coursesContainer.appendChild(createCourseRow(course));
                    });
                } else {
                    // add one empty row
                    coursesContainer.appendChild(createCourseRow());
                }
            } else {
                coursesContainer.appendChild(createCourseRow());
            }
        } else {
            // future semester - start with one empty row
            coursesContainer.appendChild(createCourseRow());
        }
        
        calculatePrediction();
    }
    
    // ========== INIT ==========
    const current = calculateCurrentCGPA();
    document.getElementById('currentCGPA').textContent = current.cgpa;
    document.getElementById('cgpaDisplay').textContent = current.cgpa;
    
    populateSemesterDropdown();
    
    // start with one empty course row
    document.getElementById('whatIfCourses').appendChild(createCourseRow());
    calculatePrediction();
    
    // ========== EVENT LISTENERS ==========
    
    // semester selector change
    document.getElementById('semesterSelect').addEventListener('change', function(e) {
        loadSemesterData(e.target.value);
    });
    
    // add course button
    document.getElementById('addWhatIfCourse').addEventListener('click', function() {
        document.getElementById('whatIfCourses').appendChild(createCourseRow());
        calculatePrediction();
    });
    
    // update menu CGPA
    const menuCGPA = document.getElementById('menuCGPA');
    if (menuCGPA) {
        menuCGPA.textContent = `overall cgpa: ${current.cgpa}`;
    }
});