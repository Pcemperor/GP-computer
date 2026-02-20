// performance.js

// to calculate CGPA from all semesters
function calculateCGPAFromAllSemesters() {
    const gradePoints = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0 };
    let totalPoints = 0;
    let totalUnits = 0;
    
    // loop through all possible years (1-10) and semesters
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
    
    return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : '0.00';
}


document.addEventListener('DOMContentLoaded', function() {
    const semesterList = document.getElementById('semesterList');
    const cgpaDisplay = document.getElementById('cgpaDisplay');
    const menuCGPA = document.getElementById('menuCGPA');
    
    // grade points for calculation
    const gradePoints = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0 };
    
    // get all saved semesters from localStorage
    function loadAllSemesters() {
        const semesters = [];
        // check up to year 10 (safe limit)
        for (let year = 1; year <= 10; year++) {
            for (let sem of ['first', 'second']) {
                const key = `${year}-${sem}`;
                const saved = localStorage.getItem(key);
                if (saved) {
                    semesters.push(JSON.parse(saved));
                } else {
                    // create empty semester placeholder
                    semesters.push({
                        year: year,
                        semester: sem,
                        courses: [],
                        gpa: null
                    });
                }
            }
        }
        return semesters;
    }
    
    // calculate GPA for a semester
    function calculateGPA(courses) {
        if (!courses || courses.length === 0) return null;
        
        let totalPoints = 0;
        let totalUnits = 0;
        
        courses.forEach(course => {
            const unit = parseFloat(course.unit) || 0;
            const point = gradePoints[course.grade] || 0;
            totalPoints += unit * point;
            totalUnits += unit;
        });
        
        return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : null;
    }
     function createGPAChart(semesters) {
        const ctx = document.getElementById('gpaChart').getContext('2d');
        
        // Prepare data: filter semesters with GPA, create labels and values
        const chartLabels = [];
        const chartData = [];
        
        semesters.forEach(sem => {
            if (sem.courses && sem.courses.length > 0) {
                const gpa = calculateGPA(sem.courses);
                if (gpa) {
                    const semText = sem.semester === 'first' ? '1st' : '2nd';
                    chartLabels.push(`Y${sem.year} ${semText}`);
                    chartData.push(parseFloat(gpa));
                }
            }
        });
        
        // Destroy existing chart if any
        let existingChart = Chart.getChart('gpaChart');
        if (existingChart) {
            existingChart.destroy();
        }
        
        // Create new chart
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'GPA',
                    data: chartData,
                    borderColor: '#212529',
                    backgroundColor: 'rgba(33, 37, 41, 0.1)',
                    tension: 0.2,
                    pointBackgroundColor: '#212529',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#212529',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        cornerRadius: 0
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        grid: {
                            color: '#dee2e6'
                        },
                        title: {
                            display: true,
                            text: 'GPA'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    
    // render semester list
    function renderSemesters() {
    const semesters = loadAllSemesters();
    semesterList.innerHTML = '';
    
    // calculate CGPA once for the whole page
    const cgpa = calculateCGPAFromAllSemesters();
    
    // Update both CGPA displays
    document.getElementById('cgpaDisplay').textContent = cgpa;
    if (document.getElementById('menuCGPA')) {
        document.getElementById('menuCGPA').textContent = `overall cgpa: ${cgpa}`;
    }
    createGPAChart(semesters);
    
    let currentYear = 0;
    
    semesters.forEach(sem => {
        // calculate GPA for this semester
        const gpa = sem.courses.length > 0 ? calculateGPA(sem.courses) : null;
        
        // year header
        if (sem.year !== currentYear) {
            currentYear = sem.year;
            const yearHeader = document.createElement('h3');
            yearHeader.className = 'year-header mt-3 mb-2';
            yearHeader.textContent = `Year ${currentYear}`;
            semesterList.appendChild(yearHeader);
        }
        
        // semester card
        const card = document.createElement('div');
        card.className = 'bg-white p-4 border d-flex justify-content-between align-items-center';
        
        const semText = sem.semester === 'first' ? '1st sem' : '2nd sem';
        const gpaDisplay = gpa ? gpa : '--';
        
        card.innerHTML = `
            <div>
                <span class="fw-medium">${semText}</span>
                <span class="ms-3 text-secondary">GP: ${gpaDisplay}</span>
            </div>
            <a href="semester.html?year=${sem.year}&sem=${sem.semester}" class="btn btn-outline-dark rounded-0 px-4 py-1 border-1">
                edit
            </a>
        `;
        
        semesterList.appendChild(card);
    });
}

    
    renderSemesters();
    
    // refresh when coming back to page
    window.addEventListener('focus', renderSemesters);
});