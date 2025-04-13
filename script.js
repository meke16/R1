document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    const saveTasksBtn = document.getElementById('saveTasksBtn');
    const totalTasksSpan = document.getElementById('totalTasks');
    const completedTasksSpan = document.getElementById('completedTasks');

    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';

    // Initialize the app
    function init() {
        renderTasks();
        updateStats();
        addEventListeners();
    }

    // Add event listeners
    function addEventListeners() {
        // Add task
        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTask();
        });

        // Filter buttons
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderTasks();
            });
        });

        // Clear completed tasks
        clearCompletedBtn.addEventListener('click', clearCompletedTasks);

        // Save tasks
        saveTasksBtn.addEventListener('click', saveTasks);

        // Use event delegation for dynamic elements
        taskList.addEventListener('change', function(e) {
            if (e.target.classList.contains('task-checkbox')) {
                const taskId = parseInt(e.target.closest('.task-item').dataset.id);
                const isCompleted = e.target.checked;
                toggleTaskCompletion(taskId, isCompleted);
            }
        });

        taskList.addEventListener('click', function(e) {
            const taskItem = e.target.closest('.task-item');
            if (!taskItem) return;
            
            const taskId = parseInt(taskItem.dataset.id);
            
            if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
                deleteTask(taskId);
            }
            
            if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
                const taskText = taskItem.querySelector('.task-text');
                editTask(taskId, taskText);
            }
        });
    }

    // Add a new task
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') return;

        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask);
        saveToLocalStorage();
        taskInput.value = '';
        renderTasks();
        updateStats();
    }

    // Render tasks based on current filter
    function renderTasks() {
        taskList.innerHTML = '';

        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'empty-message';
            
            // Set the text content based on the filter
            emptyMessage.textContent = currentFilter === 'all' ? 'No tasks yet. Add one above!' : 
                                       currentFilter === 'active' ? 'No active tasks!' : 'No completed tasks!';
        
            // Add a unique class for styling based on the filter
            if (currentFilter === 'all') {
                emptyMessage.classList.add('empty-all');
            } else if (currentFilter === 'active') {
                emptyMessage.classList.add('empty-active');
            } else if (currentFilter === 'completed') {
                emptyMessage.classList.add('empty-completed');
            }
        
            taskList.appendChild(emptyMessage);
            return;
        }
        

        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.dataset.id = task.id;

            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;

            taskList.appendChild(taskItem);
        });
    }

    // Toggle task completion status
    function toggleTaskCompletion(id, isCompleted) {
        tasks = tasks.map(task => 
            task.id === id ? {...task, completed: isCompleted} : task
        );
        saveToLocalStorage();
        updateStats();
        
        // Re-render only if we're in a filtered view
        if (currentFilter !== 'all') {
            renderTasks();
        }
    }

    // Edit task text
    function editTask(id, taskTextElement) {
        const currentText = taskTextElement.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-input';
        
        taskTextElement.replaceWith(input);
        input.focus();

        const saveEdit = function() {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                tasks = tasks.map(task => 
                    task.id === id ? {...task, text: newText} : task
                );
                saveToLocalStorage();
                renderTasks();
            } else {
                renderTasks();
            }
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') saveEdit();
        });
    }

    // Delete a task
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveToLocalStorage();
        renderTasks();
        updateStats();
    }

    // Clear all completed tasks
    function clearCompletedTasks() {
        tasks = tasks.filter(task => !task.completed);
        saveToLocalStorage();
        renderTasks();
        updateStats();
    }

    // Save tasks to localStorage
    function saveToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Save tasks with confirmation
    function saveTasks() {
        saveToLocalStorage();
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = 'Tasks saved successfully!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Update task statistics
    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        
        totalTasksSpan.textContent = `${total} ${total === 1 ? 'task' : 'tasks'}`;
        completedTasksSpan.textContent = `${completed} completed`;
    }

    // Initialize the app
    init();
});