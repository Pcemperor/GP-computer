// gp.js 

document.addEventListener('DOMContentLoaded', function() {
    const yearsContainer = document.getElementById('yearsContainer');
    const maxYears = 7;

    // 
    yearsContainer.innerHTML = '';

    for (let year = 1; year <= maxYears; year++) {
        // create year block
        const yearDiv = document.createElement('div');
        yearDiv.className = 'year-block';

        // year header
        const yearHeader = document.createElement('h2');
        yearHeader.className = 'year-header';
        yearHeader.textContent = `Year ${year}`;
        yearDiv.appendChild(yearHeader);

        // semester row container
        const semesterRow = document.createElement('div');
        semesterRow.className = 'semester-row';

        // first semester pill
        const firstSem = document.createElement('a');
        firstSem.className = 'semester-pill';
        firstSem.href = '#';  
        firstSem.textContent = '1st sem';
       
        firstSem.dataset.year = year;
        firstSem.dataset.semester = 'first';

        // second semester pill
        const secondSem = document.createElement('a');
        secondSem.className = 'semester-pill';
        secondSem.href = '#'; 
        secondSem.textContent = '2nd sem';
        secondSem.dataset.year = year;
        secondSem.dataset.semester = 'second';

        semesterRow.appendChild(firstSem);
        semesterRow.appendChild(secondSem);
        yearDiv.appendChild(semesterRow);

        yearsContainer.appendChild(yearDiv);
    }

    // handle add year button
    document.getElementById('addYearBtn').addEventListener('click', function() {
        const currentYears = document.querySelectorAll('.year-block').length;
        const newYear = currentYears + 1;

        const yearDiv = document.createElement('div');
        yearDiv.className = 'year-block';

        const yearHeader = document.createElement('h2');
        yearHeader.className = 'year-header';
        yearHeader.textContent = `Year ${newYear}`;
        yearDiv.appendChild(yearHeader);

        const semesterRow = document.createElement('div');
        semesterRow.className = 'semester-row';

        const firstSem = document.createElement('a');
        firstSem.className = 'semester-pill';
        firstSem.href = '#';
        firstSem.textContent = '1st sem';
        firstSem.dataset.year = newYear;
        firstSem.dataset.semester = 'first';

        const secondSem = document.createElement('a');
        secondSem.className = 'semester-pill';
        secondSem.href = '#';
        secondSem.textContent = '2nd sem';
        secondSem.dataset.year = newYear;
        secondSem.dataset.semester = 'second';

        semesterRow.appendChild(firstSem);
        semesterRow.appendChild(secondSem);
        yearDiv.appendChild(semesterRow);

        yearsContainer.appendChild(yearDiv);
    });


    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('semester-pill')) {
            e.preventDefault();
            const year = e.target.dataset.year;
            const semester = e.target.dataset.semester;

             window.location.href = `semester.html?year=${year}&sem=${semester}`;
        }
    });

    function updateIndexCGPA() {
        const gradePoints = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0 };
        let totalPoints = 0;
        let totalUnits = 0;
        
        // loop through all possible years and semesters
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
        
        const cgpa = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : '0.00';
        
        // Update CGPA pill at the top
        const cgpaElement = document.querySelector('.bg-white.px-4.py-2.border.fw-semibold');
        if (cgpaElement) {
            cgpaElement.innerHTML = `🔥 ${cgpa}`;
        }
        
        // update menu CGPA if it exists
        const menuCGPA = document.getElementById('menuCGPA');
        if (menuCGPA) {
            menuCGPA.textContent = `overall cgpa: ${cgpa}`;
        }
    }

    // 
    updateIndexCGPA();

    // Update when returning to page
    window.addEventListener('focus', updateIndexCGPA);

});


function updateMenuCGPA() {
    const menuCGPA = document.getElementById('menuCGPA');
    if (menuCGPA) {
   
    }
}