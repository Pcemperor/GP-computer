// darkmode.js - handle dark mode across all pages

(function() {
    // check for saved preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // apply dark mode if saved
    if (savedDarkMode) {
        document.body.classList.add('dark-mode');
    }
    
    // function to update toggle switch state
    function updateToggleState() {
        const toggle = document.getElementById('darkModeToggle');
        if (toggle) {
            toggle.checked = document.body.classList.contains('dark-mode');
        }
    }
    
    // function to toggle dark mode
    function toggleDarkMode(enable) {
        if (enable) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', enable);
        
        // update toggle in all offcanvases (in case multiple are open)
        document.querySelectorAll('#darkModeToggle').forEach(toggle => {
            toggle.checked = enable;
        });
    }
    
    // initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // set initial toggle state
        updateToggleState();
        
        // add event listener to toggle
        const toggle = document.getElementById('darkModeToggle');
        if (toggle) {
            toggle.addEventListener('change', function(e) {
                toggleDarkMode(e.target.checked);
            });
        }
    });
    
    // expose to global scope for any inline handlers
    window.toggleDarkMode = toggleDarkMode;
})();