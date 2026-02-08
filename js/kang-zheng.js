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
    const canvas = document.getElementById('financesChart');
    
    // Safety check: exit if canvas doesn't exist
    if (!canvas) return;
    
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
                    display: true // Hide default legend
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
    const ctx = canvas.getContext("2d");
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
            e.preventDefault(); // Prevent form submission
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
            const deleteBtn = document.querySelector(".delete-filter-btn");
            filterGroup.insertBefore(newButton, deleteBtn);
            
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
        const modal = document.getElementById('dishModal');
        const modalTitle = document.getElementById('modalTitle');
        const deleteBtn = document.querySelector('.delete-btn');
        
        // Set modal to create mode
        modalTitle.textContent = 'Add New Dish';
        deleteBtn.style.display = 'none';
        
        // Clear dish ID
        modal.removeAttribute('data-dish-id');
        
        // Clear form
        document.getElementById('dishForm').reset();
        uploadedImageData = null; // Clear uploaded image
        document.getElementById("fileName").textContent = "No file chosen";
        
        // Show modal
        modal.classList.add('active');
    });
}

/* ----------------------------------
   FILE UPLOAD DISPLAY
   ---------------------------------- */
// Store uploaded image as base64
let uploadedImageData = null;

const dishImageInput = document.getElementById('dishImage');
if (dishImageInput) {
    dishImageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const fileName = file.name;
            document.getElementById('fileName').textContent = fileName;
            
            // Convert to base64
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedImageData = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            document.getElementById('fileName').textContent = 'No file chosen';
            uploadedImageData = null;
        }
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
    nextCustomerBtn.addEventListener('click', nextCustomerFirebase);
}

/* ----------------------------------
   SKIP QUEUE BUTTON
   ---------------------------------- */
const skipQueueBtn = document.getElementById('skipQueueBtn');
if (skipQueueBtn) {
    skipQueueBtn.addEventListener('click', skipQueueFirebase);
}

/* ----------------------------------
   RECALL BUTTON
   Go back to last SERVED number (not skipped)
   ---------------------------------- */
const recallBtn = document.getElementById('recallBtn');
if (recallBtn) {
    recallBtn.addEventListener('click', function() {
        // Fetch current queue and history from Firebase
        database.ref('queue').once('value').then((snapshot) => {
            const queueData = snapshot.val();
            const history = queueData.history || {};
            
            // Check if there's any history
            const historyKeys = Object.keys(history);
            if (historyKeys.length === 0) {
                alert('No served customers to recall!');
                return;
            }
            
            // Get the last served entry
            const lastKey = historyKeys[historyKeys.length - 1];
            const lastServed = history[lastKey];
            const lastServedNum = parseInt(lastServed.number, 10);
            
            // Remove the last history entry
            database.ref('queue/history/' + lastKey).remove();
            
            // Update queue
            database.ref('queue').update({
                currentNumber: lastServedNum,
                servedToday: Math.max(0, queueData.servedToday - 1),
                waiting: queueData.waiting + 1
            });
        });
    });
}

/* ----------------------------------
   RESET QUEUE BUTTON
   Reset queue to start (001)
   ---------------------------------- */
// Reset Queue Button
const resetQueueBtn = document.getElementById('resetQueueBtn');
if (resetQueueBtn) {
    resetQueueBtn.addEventListener('click', resetQueueFirebase);
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
    historyList.innerHTML = '<p style="text-align: center; padding: 20px;">Loading history...</p>';
    
    // Fetch history from Firebase
    database.ref('queue/history').once('value').then((snapshot) => {
        historyList.innerHTML = '';
        
        const historyData = snapshot.val();
        
        // Check if there's history
        if (!historyData || Object.keys(historyData).length === 0) {
            historyList.innerHTML = '<p class="no-history">No queue history yet. Start serving customers!</p>';
        } else {
            // Convert object to array and reverse (most recent first)
            const historyArray = Object.values(historyData).reverse();
            
            historyArray.forEach(item => {
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
    }).catch((error) => {
        console.error('Error loading history:', error);
        historyList.innerHTML = '<p class="no-history">Error loading history</p>';
        modal.classList.add('active');
    });
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
            database.ref("queue/history").remove();
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

/* ----------------------------------
   INITIALIZE FIREBASE
   ---------------------------------- */
// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHN8zHq7L-UgdOmCPzR0oHZGSYlaMXDkE",
  authDomain: "fed-assignment-fire.firebaseapp.com",
  databaseURL: "https://fed-assignment-fire-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "fed-assignment-fire",
  storageBucket: "fed-assignment-fire.firebasestorage.app",
  messagingSenderId: "897834543564",
  appId: "1:897834543564:web:6b69f8e844b24c40691569",
  measurementId: "G-3Z4JVS3RSZ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database
const database = firebase.database();

/* ============================================
   FIREBASE - MENU MANAGEMENT FUNCTIONS
   ============================================ */

// Load dishes from Firebase
function loadDishes() {
    console.log('loadDishes called!');
    console.log('database:', database);

    const dishesRef = database.ref('dishes');
    console.log('dishesRef:', dishesRef);
    
    dishesRef.on('value', (snapshot) => {
        const dishGrid = document.getElementById('dishGrid');
        if (!dishGrid) return;
        
        // Clear existing dishes
        dishGrid.innerHTML = '';
        
        const data = snapshot.val();
        console.log('data:', data);

        if (!data) {
            dishGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">No dishes found. Add your first dish!</p>';
            return;
        }
        
        console.log('Creating dish cards...');

        // Loop through dishes and create cards
        Object.keys(data).forEach(dishId => {
            const dish = data[dishId];
            
            const dishCard = document.createElement('article');
            dishCard.className = 'dish-card';
            dishCard.setAttribute('data-cuisine', dish.cuisine);
            dishCard.setAttribute('data-type', dish.type);
            dishCard.setAttribute('data-name', dish.name);
            dishCard.setAttribute('data-id', dishId);
            
            dishCard.innerHTML = `
                <img src="${dish.image}" alt="${dish.name}" class="dish-image">
                <div class="dish-info">
                    <h3 class="dish-name">${dish.name}</h3>
                    <p class="dish-cuisine">${dish.cuisine.charAt(0).toUpperCase() + dish.cuisine.slice(1)}</p>
                    <p class="dish-price">$${dish.price.toFixed(2)}</p>
                    <button class="edit-btn" onclick="openEditModalFirebase('${dishId}')">EDIT</button>
                </div>
            `;
            
            dishGrid.appendChild(dishCard);
        });
        
        // Update stats
        updateDishStats();
    });
}

// Open modal for editing (Firebase version)
function openEditModalFirebase(dishId) {
    database.ref('dishes/' + dishId).once('value').then((snapshot) => {
        const dish = snapshot.val();
        if (!dish) return;
        
        const modal = document.getElementById('dishModal');
        const modalTitle = document.getElementById('modalTitle');
        const deleteBtn = document.querySelector('.delete-btn');
        
        // Set modal to edit mode
        modalTitle.textContent = 'Edit Dish';
        deleteBtn.style.display = 'inline-block';
        
        // Store dish ID for later
        modal.setAttribute('data-dish-id', dishId);
        
        // Fill form
        document.getElementById('dishName').value = dish.name;
        document.getElementById('dishPrice').value = dish.price;
        document.getElementById('dishCuisine').value = dish.cuisine;
        document.getElementById('dishFoodType').value = dish.type;
        
        // Show modal
        modal.classList.add('active');
    });
}

// Add new dish
function addDishFirebase(dishData) {
    const newDishRef = database.ref('dishes').push();
    return newDishRef.set(dishData);
}

// Update existing dish
function updateDishFirebase(dishId, dishData) {
    return database.ref('dishes/' + dishId).update(dishData);
}

// Delete dish
function deleteDishFirebase(dishId) {
    return database.ref('dishes/' + dishId).remove();
}

// Update form submission to use Firebase
const dishForm = document.getElementById('dishForm');
if (dishForm) {
    dishForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const modal = document.getElementById('dishModal');
        const dishId = modal.getAttribute('data-dish-id');
        
        const dishData = {
            name: document.getElementById('dishName').value,
            price: parseFloat(document.getElementById('dishPrice').value),
            cuisine: document.getElementById('dishCuisine').value,
            type: document.getElementById('dishFoodType').value,
            image: '/images/placeholder.jpg', // Default image
            available: true
        };
        
        if (dishId) {
            // Update existing dish
            updateDishFirebase(dishId, dishData)
                .then(() => {
                    alert('Dish updated successfully!');
                    closeModal();
                })
                .catch((error) => {
                    alert('Error updating dish: ' + error.message);
                });
        } else {
            // Add new dish
            addDishFirebase(dishData)
                .then(() => {
                    alert('Dish added successfully!');
                    closeModal();
                })
                .catch((error) => {
                    alert('Error adding dish: ' + error.message);
                });
        }
    });
}

// Update delete button to use Firebase
function deleteDish() {
    const modal = document.getElementById('dishModal');
    const dishId = modal.getAttribute('data-dish-id');
    
    if (!dishId) {
        closeModal();
        return;
    }
    
    if (confirm('Are you sure you want to delete this dish?')) {
        deleteDishFirebase(dishId)
            .then(() => {
                alert('Dish deleted successfully!');
                closeModal();
            })
            .catch((error) => {
                alert('Error deleting dish: ' + error.message);
            });
    }
}

// Update stats from Firebase data
function updateDishStats() {
    database.ref('dishes').once('value').then((snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        
        const dishes = Object.values(data);
        const totalDishes = dishes.length;
        const activeDishes = dishes.filter(d => d.available).length;
        
        // Get unique cuisines
        const cuisines = new Set();
        dishes.forEach(d => cuisines.add(d.cuisine));
        const cuisinesCount = cuisines.size;
        
        // Update stat cards
        const statValues = document.querySelectorAll('.stat-value');
        if (statValues.length >= 3) {
            statValues[0].textContent = totalDishes;
            statValues[1].textContent = activeDishes;
            statValues[2].textContent = cuisinesCount;
        }
    });
}

// Load dishes when page loads
if (document.getElementById('dishGrid')) {
    loadDishes();
}

/* ============================================
   FIREBASE - PROMOTIONS MANAGEMENT FUNCTIONS
   ============================================ */

// Load promotions from Firebase
function loadPromotions() {
    const promosRef = database.ref('promotions');
    
    promosRef.on('value', (snapshot) => {
        const promosGrid = document.getElementById('promotionsGrid');
        if (!promosGrid) return;
        
        // Clear existing promotions
        promosGrid.innerHTML = '';
        
        const data = snapshot.val();
        if (!data) {
            promosGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">No promotions found. Create your first promotion!</p>';
            return;
        }
        
        // Loop through promotions and create cards
        Object.keys(data).forEach(promoId => {
            const promo = data[promoId];
            
            // Determine badge color based on status
            let badgeColor = 'grey';
            if (promo.status === 'active') badgeColor = 'orange';
            else if (promo.status === 'scheduled') badgeColor = 'red';
            
            const promoCard = document.createElement('article');
            promoCard.className = 'promotion-card';
            promoCard.setAttribute('data-status', promo.status);
            promoCard.setAttribute('data-id', promoId);
            
            promoCard.innerHTML = `
                <div class="promo-badge ${badgeColor}">
                    <div class="promo-discount">${promo.discount}</div>
                    <div class="promo-name">${promo.title}</div>
                </div>
                
                <span class="promo-status ${promo.status}">${promo.status.charAt(0).toUpperCase() + promo.status.slice(1)}</span>
                
                <div class="promo-details">
                    <p class="promo-description">${promo.description}</p>
                    
                    <div class="promo-info-row">
                        <span class="promo-icon">📅</span>
                        <span>Valid: ${promo.startDate} - ${promo.endDate}</span>
                    </div>
                    
                    <div class="promo-info-row">
                        <span class="promo-icon">🕐</span>
                        <span>${promo.startTime && promo.endTime ? promo.startTime + ' - ' + promo.endTime : 'All Day'}</span>
                    </div>
                    
                    <div class="promo-info-row">
                        <span class="promo-icon">✓</span>
                        <span>Applies to: ${promo.applicableItems}</span>
                    </div>
                </div>
                
                <div class="promo-actions">
                    <button class="promo-edit-btn" onclick="openPromotionModalFirebase('${promoId}')">Edit</button>
                    <button class="promo-delete-btn" onclick="deletePromotionFirebase('${promoId}')">Delete</button>
                </div>
            `;
            
            promosGrid.appendChild(promoCard);
        });
    });
}

// Add/Update promotion
function savePromotionFirebase(promoId, promoData) {
    if (promoId) {
        return database.ref('promotions/' + promoId).update(promoData);
    } else {
        const newPromoRef = database.ref('promotions').push();
        return newPromoRef.set(promoData);
    }
}

// Delete promotion
function deletePromotionFirebase(promoId) {
    if (confirm('Are you sure you want to delete this promotion?')) {
        database.ref('promotions/' + promoId).remove()
            .then(() => {
                alert('Promotion deleted successfully!');
            })
            .catch((error) => {
                alert('Error deleting promotion: ' + error.message);
            });
    }
}

// Load promotions when page loads
if (document.getElementById('promotionsGrid')) {
    loadPromotions();
}

/* ============================================
   FIREBASE - QUEUE MANAGEMENT FUNCTIONS
   ============================================ */

// Load queue data from Firebase
function loadQueueData() {
    const queueRef = database.ref('queue');
    
    queueRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        
        // Update display
        const queueNumberEl = document.getElementById('queueNumber');
        if (queueNumberEl) {
            queueNumberEl.textContent = String(data.currentNumber).padStart(3, '0');
        }
        
        const servedTodayEl = document.getElementById('servedToday');
        if (servedTodayEl) {
            servedTodayEl.textContent = data.servedToday;
        }
        
        const waitingCountEl = document.getElementById('waitingCount');
        if (waitingCountEl) {
            waitingCountEl.textContent = data.waiting;
        }
        
        // Calculate average waiting time
        const avgWaitTimeEl = document.getElementById('avgWaitTime');
        if (avgWaitTimeEl) {
            const avgMinutes = 3 + Math.floor(data.waiting / 2);
            avgWaitTimeEl.textContent = avgMinutes + 'm';
        }
    });
}

// Next customer
function nextCustomerFirebase() {
    database.ref('queue').once('value').then((snapshot) => {
        const queueData = snapshot.val();
        
        // Add to history
        const historyRef = database.ref('queue/history').push();
        historyRef.set({
            number: String(queueData.currentNumber).padStart(3, '0'),
            orders: 'Sample Order' // Replace with actual order data
        });
        
        // Update queue
        database.ref('queue').update({
            currentNumber: queueData.currentNumber + 1,
            servedToday: queueData.servedToday + 1,
            waiting: Math.max(0, queueData.waiting - 1)
        });
    });
}

// Skip queue
function skipQueueFirebase() {
    if (confirm('Skip this queue number? (Customer did not show up)')) {
        database.ref('queue').once('value').then((snapshot) => {
            const queueData = snapshot.val();
            
            database.ref('queue').update({
                currentNumber: queueData.currentNumber + 1
            });
        });
    }
}

// Reset queue
function resetQueueFirebase() {
    if (confirm('Reset queue to start? This will clear all progress.')) {
        database.ref('queue').update({
            currentNumber: 1,
            servedToday: 0,
            waiting: 2
        });
    }
}

// Load queue when page loads
if (document.getElementById('queueNumber')) {
    loadQueueData();
}

/* ============================================
   FIREBASE - ORDERS (OVERVIEW PAGE)
   ============================================ */

// Load orders from Firebase
function loadOrders() {
    const ordersRef = database.ref('orders');
    
    ordersRef.on('value', (snapshot) => {
        const ordersTableBody = document.querySelector('#orders-tbody');
        if (!ordersTableBody) return;
        
        // Clear existing rows
        ordersTableBody.innerHTML = '';
        
        const data = snapshot.val();
        if (!data) {
            ordersTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No orders found</td></tr>';
            return;
        }
        
        // Loop through orders and create rows
        Object.keys(data).forEach(orderId => {
            const order = data[orderId];
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="order-checkbox"></td>
                <td>${orderId}</td>
                <td>${order.customer}</td>
                <td>${order.phone}</td>
                <td>${order.datetime}
                </td>
                <td>$${order.total.toFixed(2)}</td>
            `;
            
            ordersTableBody.appendChild(row);
        });
        
        // Setup checkbox listeners after orders are loaded
        setupCheckboxListeners();
    });
}

// Load orders when page loads

// Setup checkbox listeners (called after orders load)
function setupCheckboxListeners() {
    const selectAllCheckbox = document.getElementById('select-all');
    const rowCheckboxes = document.querySelectorAll('.order-checkbox');
    
    if (!selectAllCheckbox || rowCheckboxes.length === 0) return;
    
    // Remove old listeners by cloning (to avoid duplicates)
    const newSelectAll = selectAllCheckbox.cloneNode(true);
    selectAllCheckbox.parentNode.replaceChild(newSelectAll, selectAllCheckbox);
    
    // Select all checkbox
    newSelectAll.addEventListener('change', function() {
        const currentRowCheckboxes = document.querySelectorAll('.order-checkbox');
        currentRowCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });
    
    // Individual checkboxes
    rowCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const currentRowCheckboxes = document.querySelectorAll('.order-checkbox');
            const allChecked = Array.from(currentRowCheckboxes).every(cb => cb.checked);
            const someChecked = Array.from(currentRowCheckboxes).some(cb => cb.checked);
            
            newSelectAll.checked = allChecked;
            newSelectAll.indeterminate = someChecked && !allChecked;
        });
    });
}
if (document.querySelector('#orders-tbody')) {
    loadOrders();
}
/* ============================================
   ADDITIONAL FIREBASE FUNCTIONS
   ============================================ */

// Open promotion modal for editing (Firebase version)
function openPromotionModalFirebase(promoId) {
    database.ref('promotions/' + promoId).once('value').then((snapshot) => {
        const promo = snapshot.val();
        if (!promo) return;
        
        const modal = document.getElementById('promotionModal');
        const modalTitle = document.getElementById('promoModalTitle');
        const createBtn = document.querySelector('.promo-create-btn');
        
        if (!modal) return;
        
        // Set modal to edit mode
        modalTitle.textContent = 'Edit Promotion';
        createBtn.textContent = 'Save Changes';
        
        // Store promo ID for later
        modal.setAttribute('data-promo-id', promoId);
        
        // Fill form
        document.getElementById('promoTitle').value = promo.title || '';
        document.getElementById('promoDescription').value = promo.description || '';
        
        // Handle discount type and amount
        if (promo.discountType === 'bogo') {
            // Extract buy and get quantities from discount text
            const match = promo.discount.match(/Buy (\d+) Get (\d+)/);
            if (match) {
                document.getElementById('promoBuyQty').value = match[1];
                document.getElementById('promoGetQty').value = match[2];
            }
        } else {
            document.getElementById('promoTypeAmount').value = promo.discountValue || '';
        }
        
        document.getElementById('promoStartDate').value = promo.startDate || '';
        document.getElementById('promoEndDate').value = promo.endDate || '';
        document.getElementById('promoStartTime').value = promo.startTime || '';
        document.getElementById('promoEndTime').value = promo.endTime || '';
        document.getElementById('promoApplicableItems').value = promo.applicableItems || '';
        document.getElementById('promoMinSpend').value = promo.minSpend || '';
        
        // Set active discount type button
        const discountTypeBtns = document.querySelectorAll('.discount-type-btn');
        discountTypeBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-type') === promo.discountType) {
                btn.classList.add('active');
            }
        });
        
        // Show/hide appropriate fields based on discount type
        toggleTypeAmountField(promo.discountType);
        
        // Show modal
        modal.classList.add('active');
    }).catch((error) => {
        console.error('Error loading promotion:', error);
        alert('Error loading promotion: ' + error.message);
    });
}

// Update promotion form submission to work with Firebase
// This replaces the existing form handler
const existingPromoForm = document.getElementById('promotionForm');
if (existingPromoForm) {
    // Remove old event listeners by cloning the element
    const newPromoForm = existingPromoForm.cloneNode(true);
    existingPromoForm.parentNode.replaceChild(newPromoForm, existingPromoForm);
    
    newPromoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const modal = document.getElementById('promotionModal');
        const promoId = modal.getAttribute('data-promo-id');
        
        // Get form values
        const title = document.getElementById('promoTitle').value;
        const description = document.getElementById('promoDescription').value;
        const discountType = document.querySelector('.discount-type-btn.active').getAttribute('data-type');
        const startDate = document.getElementById('promoStartDate').value;
        const endDate = document.getElementById('promoEndDate').value;
        const startTime = document.getElementById('promoStartTime').value;
        const endTime = document.getElementById('promoEndTime').value;
        const applicableItems = document.getElementById('promoApplicableItems').value;
        const minSpend = document.getElementById('promoMinSpend').value;
        
        // Get discount value and format based on type
        let discountValue = 0;
        let discount = '';
        
        if (discountType === 'bogo') {
            const buyQty = document.getElementById('promoBuyQty').value;
            const getQty = document.getElementById('promoGetQty').value;
            discount = `Buy ${buyQty} Get ${getQty}`;
            discountValue = 0;
        } else {
            discountValue = parseFloat(document.getElementById('promoTypeAmount').value);
            if (discountType === 'percentage') {
                discount = `${discountValue}% OFF`;
            } else {
                discount = `$${discountValue} OFF`;
            }
        }
        
        const promoData = {
            title: title,
            discount: discount,
            description: description,
            discountType: discountType,
            discountValue: discountValue,
            startDate: startDate,
            endDate: endDate,
            startTime: startTime,
            endTime: endTime,
            applicableItems: applicableItems,
            minSpend: minSpend ? parseFloat(minSpend) : 0,
            status: 'active' // Default status
        };
        
        savePromotionFirebase(promoId, promoData)
            .then(() => {
                alert(promoId ? 'Promotion updated successfully!' : 'Promotion created successfully!');
                closePromotionModal();
                modal.removeAttribute('data-promo-id');
            })
            .catch((error) => {
                alert('Error saving promotion: ' + error.message);
            });
    });
}

// Update Create Promotion button to clear form and set create mode
const existingCreateBtn = document.getElementById('createPromotionBtn');
if (existingCreateBtn) {
    // Remove old event listeners
    const newCreateBtn = existingCreateBtn.cloneNode(true);
    existingCreateBtn.parentNode.replaceChild(newCreateBtn, existingCreateBtn);
    
    newCreateBtn.addEventListener('click', function() {
        const modal = document.getElementById('promotionModal');
        const modalTitle = document.getElementById('promoModalTitle');
        const createBtn = document.querySelector('.promo-create-btn');
        
        // Set modal to create mode
        modalTitle.textContent = 'Create New Promotion';
        createBtn.textContent = 'Create Promotion';
        
        // Clear promo ID
        modal.removeAttribute('data-promo-id');
        
        // Clear form
        document.getElementById('promotionForm').reset();
        
        // Reset discount type to percentage
        const discountTypeBtns = document.querySelectorAll('.discount-type-btn');
        discountTypeBtns.forEach(btn => btn.classList.remove('active'));
        if (discountTypeBtns[0]) discountTypeBtns[0].classList.add('active');
        
        toggleTypeAmountField('percentage');
        
        // Show modal
        modal.classList.add('active');
    });
}
