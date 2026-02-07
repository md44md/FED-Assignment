/* ============================================
   OVERVIEW PAGE JAVASCRIPT
   ============================================ */

/* ============================================
   INITIALIZATION
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    initializeChart();
    initializeCheckboxes();
    initializePagination();
});

/* ============================================
   CHART INITIALIZATION
   Creates the Store Finances line chart using Chart.js
   ============================================ */
function initializeChart() {
    // Get the canvas element where chart will be drawn
    const ctx = document.getElementById('financesChart');
    
    // Safety check: exit if canvas doesn't exist
    if (!ctx) return;
    
    // MOCK DATA - Sample financial data for demonstration
    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], // Months
        datasets: [
            {
                label: 'Expenses',
                data: [3000, 3500, 2800, 4000, 3200, 3800], // Monthly expenses
                borderColor: '#FF6B6B',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                tension: 0.4 // Curve the line
            },
            {
                label: 'Net Profit',
                data: [2500, 3200, 3800, 3000, 4200, 4500], // Monthly profit
                borderColor: '#51CF66',
                backgroundColor: 'rgba(81, 207, 102, 0.1)',
                tension: 0.4 // Curve the line
            }
        ]
    };

    // Chart configuration options
    const config = {
        type: 'line', // Line chart type
        data: chartData,
        options: {
            responsive: true, // Resize with window
            maintainAspectRatio: true, // Keep proportions
            plugins: {
                legend: {
                    display: false // Hide default legend
                }
            },
            scales: {
                y: {
                    beginAtZero: true, // Y-axis starts at 0
                    ticks: {
                        // Add dollar sign to Y-axis numbers
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    };

    // Create the chart
    new Chart(ctx, config);
}

/* ============================================
   CHECKBOX FUNCTIONALITY
   ============================================ */
function initializeCheckboxes() {
    // Get the "select all" checkbox in table header
    const selectAllCheckbox = document.getElementById('select-all');
    
    // Get all individual row checkboxes
    const rowCheckboxes = document.querySelectorAll('.orders-table tbody input[type="checkbox"]');

    // Safety check: exit if select-all checkbox doesn't exist
    if (!selectAllCheckbox) return;

    /* ---------------------------------- 
        EVENT: Select All Checkbox Clicked
        NOTE: Currently, checked boxes dont affect anything yet
       ---------------------------------- */
    selectAllCheckbox.addEventListener('change', function() {
        rowCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked; // Set each row checkbox to match select-all state
        });
    });

    /* ----------------------------------
        EVENT: Individual Row Checkbox Clicked
        NOTE: Currently, checked boxes dont affect anything yet
       ---------------------------------- */
    rowCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Check if ALL row checkboxes are checked
            const allChecked = Array.from(rowCheckboxes).every(cb => cb.checked);
            
            // Check if SOME (but not all) row checkboxes are checked
            const someChecked = Array.from(rowCheckboxes).some(cb => cb.checked);
            
            // Update select-all checkbox
            selectAllCheckbox.checked = allChecked;
            selectAllCheckbox.indeterminate = someChecked && !allChecked; // Show dash if some selected
        });
    });
}

/* ============================================
   PAGINATION CONTROLS
   ============================================ */
function initializePagination() {
    // Get all page number buttons
    const pageButtons = document.querySelectorAll('.page-btn');
    
    /* ----------------------------------
       EVENT: Page Button Clicked
       ---------------------------------- */
    pageButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons (make them white)
            pageButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button (make it green)
            this.classList.add('active');
            
            // TODO: Load data for the selected page from Firebase
        });
    });
}

/* ============================================
   FILTER DROPDOWN
   ============================================ */
const filterDropdown = document.querySelector('.filter-dropdown');
if (filterDropdown) {
    filterDropdown.addEventListener('change', function() {
        // TODO: Filter orders table based on selected date range
    });
}