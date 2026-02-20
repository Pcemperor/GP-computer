// about.js - handle feedback form and CGPA display

document.addEventListener('DOMContentLoaded', function() {
    
    // UPDATE CGPA DISPLAY 
    function updateCGPA() {
        const gradePoints = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0 };
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
        
        const cgpa = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : '0.00';
        document.getElementById('cgpaDisplay').textContent = cgpa;
        
        const menuCGPA = document.getElementById('menuCGPA');
        if (menuCGPA) {
            menuCGPA.textContent = `overall cgpa: ${cgpa}`;
        }
    }
    
    // FEEDBACK TO WHATSAPP 
    function sendToWhatsApp() {
        const type = document.getElementById('feedbackType').value;
        const message = document.getElementById('feedbackMessage').value.trim();
        
        if (!message) {
            alert('please enter a message');
            return;
        }
        
        // Map type to emoji/label
        const typeLabels = {
            'suggestion': '💡 Suggestion',
            'bug': '🐛 Bug Report',
            'feature': '✨ Feature Request',
            'other': '📝 Other'
        };
        
        // Format the message
        const fullMessage = `*${typeLabels[type]}*\n\n${message}\n\n---\nfrom Compute GPA app`;
        
        // WhatsApp URL (replace with your number)
        const phoneNumber = '2348024304000'; // CHANGE THIS TO YOUR NUMBER
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(fullMessage)}`;
        
        // Open WhatsApp
        window.open(whatsappURL, '_blank');
    }
    
    // ========== UPDATE SOCIAL LINKS ==========
    // Replace with your actual social media handles
    function updateSocialLinks() {
        // Update these with your actual profiles
        const socialLinks = {
            x: 'https://x.com/iseeyoubruh_1',
            whatsapp: 'https://wa.me/2348024304000', // your WhatsApp number
            github: 'https://github.com/Pcemperor/',
            linkedin: 'https://www.linkedin.com/in/iseeyoubruh'
        };
        
        const buttons = document.querySelectorAll('.btn-outline-dark');
        if (buttons.length >= 4) {
            buttons[0].href = socialLinks.x;
            buttons[1].href = socialLinks.whatsapp;
            buttons[2].href = socialLinks.github;
            buttons[3].href = socialLinks.linkedin;
        }
    }
    
    // ========== INIT ==========
    updateCGPA();
    updateSocialLinks();
    
    // ========== EVENT LISTENERS ==========
    document.getElementById('sendFeedbackBtn').addEventListener('click', sendToWhatsApp);
    
    // refresh CGPA when page gains focus
    window.addEventListener('focus', updateCGPA);
    
    // Optional: clear form after sending
    window.addEventListener('blur', function() {
        // small delay to check if WhatsApp opened
        setTimeout(() => {
            // you could clear the form here if wanted
        }, 500);
    });
});