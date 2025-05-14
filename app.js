// DOM Elements
const taskInput = document.getElementById('taskInput');
const taskPriority = document.getElementById('taskPriority');
const taskCategory = document.getElementById('taskCategory');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const totalTasks = document.getElementById('totalTasks');
const completedTasks = document.getElementById('completedTasks');
const highPriorityTasks = document.getElementById('highPriorityTasks');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');

// Dialog Elements
const confirmDialog = document.getElementById('confirmDialog');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');
const taskDetailsDialog = document.getElementById('taskDetailsDialog');
const detailsTaskText = document.getElementById('detailsTaskText');
const detailsTaskPriority = document.getElementById('detailsTaskPriority');
const detailsTaskCategory = document.getElementById('detailsTaskCategory');
const detailsTaskNotes = document.getElementById('detailsTaskNotes');
const cancelDetails = document.getElementById('cancelDetails');
const saveDetails = document.getElementById('saveDetails');

// State
let tasks = [];
let currentFilter = 'all';
let searchTerm = '';
let taskToDelete = null;
let taskToEdit = null;
let darkMode = false;

// Check if localStorage is available
const isLocalStorageAvailable = () => {
    try {
        const test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
};

// Load tasks from localStorage
const loadTasks = () => {
    if (isLocalStorageAvailable()) {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }
        
        // Load theme preference
        const storedTheme = localStorage.getItem('darkMode');
        if (storedTheme) {
            darkMode = storedTheme === 'true';
            updateTheme();
        }
    }
};

// Save tasks to localStorage
const saveTasks = () => {
    if (isLocalStorageAvailable()) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
};

// Save theme preference
const saveThemePreference = () => {
    if (isLocalStorageAvailable()) {
        localStorage.setItem('darkMode', darkMode);
    }
};

// Update theme
const updateTheme = () => {
    if (darkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.textContent = '🌙';
    }
};

// Toggle theme
const toggleTheme = () => {
    darkMode = !darkMode;
    updateTheme();
    saveThemePreference();
};

// Render tasks based on current filter and search term
const renderTasks = () => {
    taskList.innerHTML = '';
    
    let filteredTasks = tasks;
    
    // Apply filter
    if (currentFilter === 'active') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
    }
    
    // Apply search
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredTasks = filteredTasks.filter(task => 
            task.text.toLowerCase().includes(term) || 
            (task.notes && task.notes.toLowerCase().includes(term))
        );
    }
    
    filteredTasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
        taskItem.dataset.id = task.id;
        
        taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <span class="task-text">${task.text}</span>
                <div class="task-meta">
                    <span class="task-priority ${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                    <span class="task-category ${task.category}">${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
                    ${task.notes ? '<span class="task-has-notes">📝</span>' : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="details-btn" title="View Details">📋</button>
                <button class="edit-btn" title="Edit Task">✏️</button>
                <button class="delete-btn" title="Delete Task">🗑️</button>
            </div>
        `;
        
        taskList.appendChild(taskItem);
    });
    
    updateTaskStats();
};

// Update task statistics
const updateTaskStats = () => {
    const activeTasks = tasks.filter(task => !task.completed).length;
    const completed = tasks.filter(task => task.completed).length;
    const highPriority = tasks.filter(task => task.priority === 'high').length;
    
    taskCount.textContent = activeTasks;
    totalTasks.textContent = tasks.length;
    completedTasks.textContent = completed;
    highPriorityTasks.textContent = highPriority;
};

// Add a new task
const addTask = () => {
    const text = taskInput.value.trim();
    if (text) {
        const newTask = {
            id: Date.now().toString(),
            text,
            priority: taskPriority.value,
            category: taskCategory.value,
            completed: false,
            notes: '',
            createdAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        
        taskInput.value = '';
        taskInput.focus();
    }
};

// Delete a task
const deleteTask = (id) => {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
};

// Show delete confirmation dialog
const showDeleteConfirmation = (id) => {
    taskToDelete = id;
    confirmDialog.classList.add('active');
};

// Hide delete confirmation dialog
const hideDeleteConfirmation = () => {
    confirmDialog.classList.remove('active');
    taskToDelete = null;
};

// Toggle task completion status
const toggleTaskCompletion = (id) => {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
};

// Show task details dialog
const showTaskDetails = (id) => {
    const task = tasks.find(task => task.id === id);
    if (task) {
        taskToEdit = id;
        detailsTaskText.value = task.text;
        detailsTaskPriority.value = task.priority;
        detailsTaskCategory.value = task.category;
        detailsTaskNotes.value = task.notes || '';
        
        taskDetailsDialog.classList.add('active');
    }
};

// Hide task details dialog
const hideTaskDetails = () => {
    taskDetailsDialog.classList.remove('active');
    taskToEdit = null;
};

// Save task details
const saveTaskDetails = () => {
    if (taskToEdit) {
        const newText = detailsTaskText.value.trim();
        if (newText) {
            tasks = tasks.map(task => {
                if (task.id === taskToEdit) {
                    return {
                        ...task,
                        text: newText,
                        priority: detailsTaskPriority.value,
                        category: detailsTaskCategory.value,
                        notes: detailsTaskNotes.value.trim()
                    };
                }
                return task;
            });
            
            saveTasks();
            renderTasks();
            hideTaskDetails();
        }
    }
};

// Clear completed tasks
const clearCompletedTasks = () => {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
};

// Set current filter
const setFilter = (filter) => {
    currentFilter = filter;
    
    filterBtns.forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderTasks();
};

// Handle search
const handleSearch = () => {
    searchTerm = searchInput.value.trim();
    renderTasks();
};

// Event Listeners
addTaskBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

taskList.addEventListener('click', (e) => {
    const taskItem = e.target.closest('.task-item');
    if (!taskItem) return;
    
    const taskId = taskItem.dataset.id;
    
    if (e.target.classList.contains('task-checkbox')) {
        toggleTaskCompletion(taskId);
    } else if (e.target.classList.contains('delete-btn')) {
        showDeleteConfirmation(taskId);
    } else if (e.target.classList.contains('edit-btn')) {
        showTaskDetails(taskId);
    } else if (e.target.classList.contains('details-btn')) {
        showTaskDetails(taskId);
    }
});

clearCompletedBtn.addEventListener('click', clearCompletedTasks);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
    });
});

searchInput.addEventListener('input', handleSearch);

// Confirmation dialog events
cancelDelete.addEventListener('click', hideDeleteConfirmation);
confirmDelete.addEventListener('click', () => {
    if (taskToDelete) {
        deleteTask(taskToDelete);
        hideDeleteConfirmation();
    }
});

// Task details dialog events
cancelDetails.addEventListener('click', hideTaskDetails);
saveDetails.addEventListener('click', saveTaskDetails);

// Theme toggle
themeToggle.addEventListener('click', toggleTheme);

// Initialize
loadTasks();
renderTasks();