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

/* ============================================
   MENU MANAGEMENT PAGE FUNCTIONS
   ============================================ */

/* ----------------------------------
   MODAL FUNCTIONS
   ---------------------------------- */

// Open modal for editing or creating a dish
function openEditModal(name = '', cuisine = '', price = '', foodType = '') {
    const modal = document.getElementById('dishModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (!modal) return; // Safety check
    
    // Get the action button (last button in modal-actions)
    const actionButtons = document.querySelector('.modal-actions');
    const lastButton = actionButtons.lastElementChild;

    // Set modal title based on if editing or creating
    if (name) {
        modalTitle.textContent = 'Edit Dish';
        lastButton.textContent = 'Delete';
        lastButton.className = 'delete-btn';
        lastButton.setAttribute('onclick', 'deleteDish()');
    } else {
        modalTitle.textContent = 'Create New Dish';
        lastButton.textContent = 'Cancel';
        lastButton.className = 'cancel-btn';
        lastButton.setAttribute('onclick', 'closeModal()');
    }
    
    // Populate form fields with dish data
    document.getElementById('dishName').value = name;
    document.getElementById('dishPrice').value = price;
    document.getElementById('dishCuisine').value = cuisine.toLowerCase();
    document.getElementById('dishFoodType').value = foodType;
    
    // Show the modal
    modal.classList.add('active');
}

// Close the modal
function closeModal() {
    const modal = document.getElementById('dishModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    
    // Reset form
    const form = document.getElementById('dishForm');
    if (form) form.reset();
    
    const fileName = document.getElementById('fileName');
    if (fileName) fileName.textContent = 'No file chosen';
}

// Delete dish function
function deleteDish() {
    if (confirm('Are you sure you want to delete this dish?')) {
        // TODO: Implement Firebase delete
        closeModal();
        alert('Dish deleted successfully!');
    }
}

/* ----------------------------------
   SEARCH FUNCTIONALITY
   ---------------------------------- */
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const dishCards = document.querySelectorAll('.dish-card');
        
        dishCards.forEach(card => {
            const dishName = card.getAttribute('data-name').toLowerCase();
            
            // Show or hide card based on search match
            if (dishName.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

/* ----------------------------------
   CUISINE FILTER DROPDOWN
   ---------------------------------- */
const cuisineFilter = document.getElementById('cuisineFilter');
if (cuisineFilter) {
    cuisineFilter.addEventListener('change', function() {
        const selectedCuisine = this.value;
        const dishCards = document.querySelectorAll('.dish-card');
        
        dishCards.forEach(card => {
            const dishCuisine = card.getAttribute('data-cuisine');
            
            // Show all if "all" selected, otherwise filter by cuisine
            if (selectedCuisine === 'all' || dishCuisine === selectedCuisine) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

/* ----------------------------------
   FOOD TYPE FILTER BUTTONS
   ---------------------------------- */
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        const selectedType = this.getAttribute('data-type');
        const dishCards = document.querySelectorAll('.dish-card');
        
        dishCards.forEach(card => {
            const dishType = card.getAttribute('data-type');
            
            // Show all if "all" selected, otherwise filter by type
            if (selectedType === 'all' || dishType === selectedType) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}); 



/* ----------------------------------
   UPDATE CUISINES QUICK STAT
   ---------------------------------- */
function updateCuisinesStat() {
    // Count unique cuisines from dropdown (not including "All Cuisines")
    const cuisineDropdown = document.getElementById('cuisineFilter');
    const cuisinesCount = cuisineDropdown.options.length - 1; // -1 to exclude "All Cuisines"
    
    // Update the third stat card
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 3) {
        statValues[2].textContent = cuisinesCount;
    }
}

/* ----------------------------------
   ADD CUISINE BUTTON
   ---------------------------------- */
const addCuisineBtn = document.getElementById('addCuisineBtn');
const newCuisineInput = document.getElementById('newCuisineInput');

if (addCuisineBtn && newCuisineInput) {
    addCuisineBtn.addEventListener('click', function() {
        // Toggle input visibility
        if (newCuisineInput.style.display === 'none' || !newCuisineInput.style.display) {
            newCuisineInput.style.display = 'inline-block';
            newCuisineInput.focus();
        } else {
            newCuisineInput.style.display = 'none';
        }
    });
    
    // Add cuisine when Enter is pressed
    newCuisineInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            const newCuisine = this.value.trim();
            
            // Add to filter dropdown
            const cuisineFilter = document.getElementById('cuisineFilter');
            const option = document.createElement('option');
            option.value = newCuisine.toLowerCase();
            option.textContent = newCuisine;
            cuisineFilter.appendChild(option);
            
            // Also add to modal form dropdown
            const dishCuisineDropdown = document.getElementById('dishCuisine');
            const modalOption = document.createElement('option');
            modalOption.value = newCuisine.toLowerCase();
            modalOption.textContent = newCuisine;
            dishCuisineDropdown.appendChild(modalOption);
            
            // Reset input
            this.value = '';
            this.style.display = 'none';
            
            alert(`"${newCuisine}" cuisine added successfully!`);
            updateCuisinesStat();
        }
    });
}

/* ----------------------------------
   DELETE CUISINE
   ---------------------------------- */
function deleteCuisineOption() {
    const cuisineFilter = document.getElementById('cuisineFilter');
    const selectedValue = cuisineFilter.value;
    
    // Prevent deleting "All Cuisines"
    if (selectedValue === 'all') {
        alert('Cannot delete "All Cuisines" option!');
        return;
    }
    
    if (confirm(`Delete "${cuisineFilter.options[cuisineFilter.selectedIndex].text}" cuisine?`)) {
        // Remove from filter dropdown
        cuisineFilter.remove(cuisineFilter.selectedIndex);
        
        // Remove from modal dropdown
        const modalDropdown = document.getElementById('dishCuisine');
        const modalOptions = modalDropdown.querySelectorAll('option');
        modalOptions.forEach(option => {
            if (option.value === selectedValue) {
                option.remove();
            }
        });
        
        alert('Cuisine deleted successfully!');
        updateCuisinesStat();
    }
}

/* ----------------------------------
   ADD FOOD TYPE BUTTON
   ---------------------------------- */
const addFoodTypeBtn = document.getElementById('addFoodTypeBtn');
const newFoodTypeInput = document.getElementById('newFoodTypeInput');

if (addFoodTypeBtn && newFoodTypeInput) {
    addFoodTypeBtn.addEventListener('click', function() {
        if (newFoodTypeInput.style.display === 'none' || !newFoodTypeInput.style.display) {
            newFoodTypeInput.style.display = 'inline-block';
            newFoodTypeInput.focus();
        } else {
            newFoodTypeInput.style.display = 'none';
        }
    });
    
    newFoodTypeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            const newType = this.value.trim();
            
            // Create new filter button
            const filterGroup = this.parentElement;
            const newButton = document.createElement('button');
            newButton.className = 'filter-btn';
            newButton.setAttribute('data-type', newType.toLowerCase());
            newButton.textContent = newType;
            
            // Add click event to new button
            newButton.addEventListener('click', function() {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                const selectedType = this.getAttribute('data-type');
                const dishCards = document.querySelectorAll('.dish-card');
                
                dishCards.forEach(card => {
                    const dishType = card.getAttribute('data-type');
                    if (dishType === selectedType) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
            
            // Insert before the + button
            filterGroup.insertBefore(newButton, addFoodTypeBtn);
            
            // Also add to modal form dropdown
            const dishFoodTypeDropdown = document.getElementById('dishFoodType');
            const option = document.createElement('option');
            option.value = newType.toLowerCase();
            option.textContent = newType;
            dishFoodTypeDropdown.appendChild(option);
            
            // Reset input
            this.value = '';
            this.style.display = 'none';
            
            alert(`"${newType}" food type added successfully!`);
        }
    });
}
/* ----------------------------------
   DELETE FOOD TYPE BUTTON
   ---------------------------------- */

function deleteSelectedFoodType() {
    // Find the active button (the one currently selected)
    const activeBtn = document.querySelector('.filter-btn.active');
    const typeValue = activeBtn.getAttribute('data-type');
    const typeText = activeBtn.textContent;
    
    // Prevent deleting "Show All"
    if (typeValue === 'all') {
        alert('Cannot delete "Show All" option!');
        return;
    }
    
    if (confirm(`Delete "${typeText}" food type?`)) {
        // Remove the button
        activeBtn.remove();
        
        // Remove from modal dropdown
        const modalDropdown = document.getElementById('dishFoodType');
        const options = modalDropdown.querySelectorAll('option');
        options.forEach(option => {
            if (option.value === typeValue) {
                option.remove();
            }
        });
        
        // Select "Show All" as default
        document.querySelector('.filter-btn[data-type="all"]').classList.add('active');
        
        alert('Food type deleted successfully!');
    }
}
/* ----------------------------------
   ADD DISH BUTTON
   ---------------------------------- */
const addDishBtn = document.getElementById('addDishBtn');
if (addDishBtn) {
    addDishBtn.addEventListener('click', function() {
        openEditModal(); // Open empty modal for new dish
    });
}

/* ----------------------------------
   FORM SUBMISSION
   ---------------------------------- */
const dishForm = document.getElementById('dishForm');
if (dishForm) {
    dishForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent page reload
        
        // Get form values
        const name = document.getElementById('dishName').value;
        const price = document.getElementById('dishPrice').value;
        const cuisine = document.getElementById('dishCuisine').value;
        const foodType = document.getElementById('dishFoodType').value;
        
        // TODO: Save to Firebase
        
        alert('Dish saved successfully!');
        closeModal();
    });
}

/* ----------------------------------
   FILE UPLOAD DISPLAY
   ---------------------------------- */
const dishImageInput = document.getElementById('dishImage');
if (dishImageInput) {
    dishImageInput.addEventListener('change', function() {
        const fileName = this.files[0] ? this.files[0].name : 'No file chosen';
        document.getElementById('fileName').textContent = fileName;
    });
}

/* ============================================
   PROMOTIONS MANAGEMENT PAGE FUNCTIONS
   ============================================ */

/* ----------------------------------
   MODAL FUNCTIONS
   ---------------------------------- */

// Open promotion modal for creating or editing
function openPromotionModal(discount = '', title = '', description = '', discountType = 'percentage', amount = '', startDate = '', endDate = '', startTime = '', endTime = '', applicableItems = '', minSpend = '', status = '') {
    const modal = document.getElementById('promotionModal');
    const modalTitle = document.getElementById('promoModalTitle');
    const createBtn = document.querySelector('.promo-create-btn');
    
    if (!modal) return;
    
    // Set modal title and button text
    if (title) {
        modalTitle.textContent = 'Edit Promotion';
        createBtn.textContent = 'Save Changes';
    } else {
        modalTitle.textContent = 'Create New Promotion';
        createBtn.textContent = 'Create Promotion';
    }
    
    // Populate form fields
    document.getElementById('promoTitle').value = title;
    document.getElementById('promoDescription').value = description;
    document.getElementById('promoTypeAmount').value = amount;
    document.getElementById('promoStartDate').value = startDate;
    document.getElementById('promoEndDate').value = endDate;
    document.getElementById('promoStartTime').value = startTime;
    document.getElementById('promoEndTime').value = endTime;
    document.getElementById('promoApplicableItems').value = applicableItems;
    document.getElementById('promoMinSpend').value = minSpend;
    
    // Set active discount type button
    const discountTypeBtns = document.querySelectorAll('.discount-type-btn');
    discountTypeBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-type') === discountType) {
            btn.classList.add('active');
        }
    });
    
    // Show/hide Type Amount based on discount type
    toggleTypeAmountField(discountType);
    
    // Show modal
    modal.classList.add('active');
}

// Close promotion modal
function closePromotionModal() {
    const modal = document.getElementById('promotionModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    
    // Reset form
    const form = document.getElementById('promotionForm');
    if (form) form.reset();
    
    // Reset discount type to percentage
    const discountTypeBtns = document.querySelectorAll('.discount-type-btn');
    discountTypeBtns.forEach(btn => btn.classList.remove('active'));
    if (discountTypeBtns[0]) discountTypeBtns[0].classList.add('active');
}

// Delete promotion
function deletePromotion() {
    if (confirm('Are you sure you want to delete this promotion?')) {
        // TODO: Implement Firebase delete
        alert('Promotion deleted successfully!');
    }
}

// Toggle Type Amount field visibility based on discount type
function toggleTypeAmountField(type) {
    const typeAmountGroup = document.getElementById('typeAmountGroup');
    const typeAmountInput = document.getElementById('promoTypeAmount');
    const bogoFieldsGroup = document.getElementById('bogoFieldsGroup');
    const buyQtyInput = document.getElementById('promoBuyQty');
    const getQtyInput = document.getElementById('promoGetQty');
    
    if (type === 'bogo') {
        typeAmountGroup.style.display = 'none';
        bogoFieldsGroup.style.display = 'grid';
        typeAmountInput.removeAttribute('required');
        buyQtyInput.setAttribute('required', 'required');
        getQtyInput.setAttribute('required', 'required');
    } else {
        typeAmountGroup.style.display = 'block';
        bogoFieldsGroup.style.display = 'none';
        typeAmountInput.setAttribute('required', 'required');
        buyQtyInput.removeAttribute('required');
        getQtyInput.removeAttribute('required');
    }
}

/* ----------------------------------
   DISCOUNT TYPE BUTTON TOGGLE
   ---------------------------------- */
const discountTypeBtns = document.querySelectorAll('.discount-type-btn');
discountTypeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active from all
        discountTypeBtns.forEach(b => b.classList.remove('active'));
        
        // Add active to clicked
        this.classList.add('active');
        
        // Toggle type amount field
        const discountType = this.getAttribute('data-type');
        toggleTypeAmountField(discountType);
    });
});

/* ----------------------------------
   FILTER BUTTONS
   ---------------------------------- */
const promoFilterBtns = document.querySelectorAll('.promo-filter-btn');
promoFilterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active from all
        promoFilterBtns.forEach(b => b.classList.remove('active'));
        
        // Add active to clicked
        this.classList.add('active');
        
        // Get filter value
        const filter = this.getAttribute('data-filter');
        const promoCards = document.querySelectorAll('.promotion-card');
        
        // Filter cards
        promoCards.forEach(card => {
            const status = card.getAttribute('data-status');
            
            if (filter === 'all' || status === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

/* ----------------------------------
   CREATE PROMOTION BUTTON
   ---------------------------------- */
const createPromotionBtn = document.getElementById('createPromotionBtn');
if (createPromotionBtn) {
    createPromotionBtn.addEventListener('click', function() {
        openPromotionModal();
    });
}

/* ----------------------------------
   FORM SUBMISSION
   ---------------------------------- */
const promotionForm = document.getElementById('promotionForm');
if (promotionForm) {
    promotionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const title = document.getElementById('promoTitle').value;
        const description = document.getElementById('promoDescription').value;
        const discountType = document.querySelector('.discount-type-btn.active').getAttribute('data-type');
        const amount = document.getElementById('promoTypeAmount').value;
        const startDate = document.getElementById('promoStartDate').value;
        const endDate = document.getElementById('promoEndDate').value;
        const startTime = document.getElementById('promoStartTime').value;
        const endTime = document.getElementById('promoEndTime').value;
        const applicableItems = document.getElementById('promoApplicableItems').value;
        const minSpend = document.getElementById('promoMinSpend').value;
        
        // TODO: Save to Firebase
        
        alert('Promotion saved successfully!');
        closePromotionModal();
    });
}

/* ============================================
   QUEUE MANAGEMENT PAGE FUNCTIONS
   ============================================ */

/* ----------------------------------
   QUEUE STATE MANAGEMENT
   ---------------------------------- */
let queueState = {
    currentNumber: 1,
    servedToday: 0,
    waiting: 2,
    history: [],
    previousNumber: null
};

/* ----------------------------------
   MOCK ORDER DATA
   Sample orders for demo purposes
   ---------------------------------- */
const mockOrders = [
    "Chicken Rice, Iced Lemon Tea",
    "Nasi Lemak",
    "Char Siew Noodles, Spring Roll",
    "Mee Rebus",
    "Curry Noodles, Iced Milo",
    "Roti Prata, Teh Tarik",
    "Chicken Briyani",
    "Mee Soto, Bandung",
    "Naan, Curry Chicken",
    "Fried Rice, Ice Water"
];

/* ----------------------------------
   GET RANDOM ORDER
   Returns a random order from mock data
   ---------------------------------- */
function getRandomOrder() {
    return mockOrders[Math.floor(Math.random() * mockOrders.length)];
}

/* ----------------------------------
   UPDATE DISPLAY
   ---------------------------------- */
function updateQueueDisplay() {
    // Update queue number display
    const queueNumberEl = document.getElementById('queueNumber');
    if (queueNumberEl) {
        queueNumberEl.textContent = String(queueState.currentNumber).padStart(3, '0');
    }
    
    // Update stats
    const servedTodayEl = document.getElementById('servedToday');
    if (servedTodayEl) {
        servedTodayEl.textContent = queueState.servedToday;
    }
    
    const waitingCountEl = document.getElementById('waitingCount');
    if (waitingCountEl) {
        waitingCountEl.textContent = queueState.waiting;
    }
    
    // Calculate average waiting time (mock calculation)
    const avgWaitTimeEl = document.getElementById('avgWaitTime');
    if (avgWaitTimeEl) {
        // Simple formula: base 3 minutes + 1 minute per person waiting
        const avgMinutes = 3 + Math.floor(queueState.waiting / 2);
        avgWaitTimeEl.textContent = avgMinutes + 'm';
    }
}

/* ----------------------------------
   NEXT CUSTOMER BUTTON
   ---------------------------------- */
const nextCustomerBtn = document.getElementById('nextCustomerBtn');
if (nextCustomerBtn) {
    nextCustomerBtn.addEventListener('click', function() {
        // Save current number to history
        const currentQueueNum = String(queueState.currentNumber).padStart(3, '0');
        queueState.history.push({
            number: currentQueueNum,
            orders: getRandomOrder()
        });
        
        // Store previous number for recall
        queueState.previousNumber = queueState.currentNumber;
        
        // Increment queue number
        queueState.currentNumber++;
        
        // Update stats
        queueState.servedToday++;
        if (queueState.waiting > 0) {
            queueState.waiting--;
        }
        
        // Update display
        updateQueueDisplay();
    });
}

/* ----------------------------------
   SKIP QUEUE BUTTON
   ---------------------------------- */
const skipQueueBtn = document.getElementById('skipQueueBtn');
if (skipQueueBtn) {
    skipQueueBtn.addEventListener('click', function() {
        if (confirm('Skip this queue number? (Customer did not show up)')) {
            // DON'T store this as previous number
            // DON'T add to history
            queueState.currentNumber++;
            
            // previousNumber stays unchanged (so recall goes to before the skip)
            
            // Update display
            updateQueueDisplay();
        }
    });
}

/* ----------------------------------
   RECALL BUTTON
   Go back to last SERVED number (not skipped)
   ---------------------------------- */
const recallBtn = document.getElementById('recallBtn');
if (recallBtn) {
    recallBtn.addEventListener('click', function() {
        // Check if there's any history (served customers)
        if (queueState.history.length > 0) {
            // Get the last served queue number from history
            const lastServed = queueState.history[queueState.history.length - 1];
            const lastServedNum = parseInt(lastServed.number, 10);
            
            // Go back to that number
            queueState.currentNumber = lastServedNum;
            
            // Remove from history
            queueState.history.pop();
            
            // Update stats
            queueState.servedToday--;
            queueState.waiting++;
            
            // Update display
            updateQueueDisplay();
        } else {
            alert('No served customers to recall!');
        }
    });
}

/* ----------------------------------
   RESET QUEUE BUTTON
   Reset queue to start (001)
   ---------------------------------- */
const resetQueueBtn = document.getElementById('resetQueueBtn');
if (resetQueueBtn) {
    resetQueueBtn.addEventListener('click', function() {
        if (confirm('Reset queue to start? This will clear all progress.')) {
            // Reset all state
            queueState.currentNumber = 1;
            queueState.servedToday = 0;
            queueState.waiting = 2;
            queueState.previousNumber = null;
            // Don't clear history - keep for records
            
            // Update display
            updateQueueDisplay();
        }
    });
}

/* ----------------------------------
   HISTORY BUTTON
   ---------------------------------- */
const historyBtn = document.getElementById('historyBtn');
if (historyBtn) {
    historyBtn.addEventListener('click', function() {
        openHistoryModal();
    });
}

/* ----------------------------------
   OPEN HISTORY MODAL
   ---------------------------------- */
function openHistoryModal() {
    const modal = document.getElementById('historyModal');
    const historyList = document.getElementById('historyList');
    
    if (!modal || !historyList) return;
    
    // Clear current list
    historyList.innerHTML = '';
    
    // Check if there's history
    if (queueState.history.length === 0) {
        historyList.innerHTML = '<p class="no-history">No queue history yet. Start serving customers!</p>';
    } else {
        // Display history items (most recent first)
        const reversedHistory = [...queueState.history].reverse();
        reversedHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-item-number">#${item.number}</div>
                <div class="history-item-orders">${item.orders}</div>
            `;
            historyList.appendChild(historyItem);
        });
    }
    
    // Show modal
    modal.classList.add('active');
}

/* ----------------------------------
   CLOSE HISTORY MODAL
   ---------------------------------- */
function closeHistoryModal() {
    const modal = document.getElementById('historyModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/* ----------------------------------
   CLEAR HISTORY BUTTON
   ---------------------------------- */
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', function() {
        if (confirm('Clear all queue history? This cannot be undone.')) {
            queueState.history = [];
            openHistoryModal(); // Refresh display
            alert('History cleared!');
        }
    });
}

/* ----------------------------------
   INITIALIZE ON PAGE LOAD
   ---------------------------------- */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize display if on queue page
    if (document.getElementById('queueNumber')) {
        updateQueueDisplay();
    }
});