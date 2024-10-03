let searchForm = document.getElementById("searchForm");
let taskForm = document.getElementById("taskForm");
let taskInput = document.getElementById("taskInput");
let searchInput = document.getElementById("searchInput");
let taskList = document.getElementById("taskList");
let filterButtons = document.getElementById("filtersButtons");
let deleteButtons = document.querySelectorAll(".delete-btn");
let completeButtons = document.querySelectorAll(".complete-btn");
let taskControl = document.querySelectorAll(".task-control");
let LOCAL_STORAGE_KEY = "todos";
let todos = [];

//*........... Event Listeners ..............*\\
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  searchForm.reset();
});

let timeoutId;
function debounce(func, delay) {
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const handleSearch = (e) => {
  const searchValue = e.target.value.toLowerCase();
  let todos = getTodosFromLocalStorage();
  const filteredTodos = todos.filter((todo) =>
    todo.task.toLowerCase().includes(searchValue)
  );
  if (filteredTodos.length === 0) {
    taskList.innerHTML = "";
    noTask("No task found");
    console.log("not found");
  } else {
    loadTodos(filteredTodos);
  }
};

searchInput.addEventListener("input", debounce(handleSearch, 100));

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  loadTodos(getTodosFromLocalStorage());
  taskForm.reset();
});

taskInput.addEventListener("change", (e) => {
  if (
    e.target.value === "" ||
    e.target.value === null ||
    e.target.value === undefined ||
    e.target.value.trim() === ""
  ) {
    return;
  }
  let task = e.target.value.toString().trim();
  console.log(task);
  let date = new Date();
  let todayDate = date.toLocaleDateString("en-GB").split("/").join("-");
  let time = `${
    date.getHours() < 10 ? "0" + date.getHours() : date.getHours()
  }:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}`;
  let taskObj = {
    id: Date.now(),
    date: todayDate,
    task: task,
    time: time,
    completed: false,
  };
  todos.unshift(taskObj);
  setTodosInLocalStorage(todos);
});

taskList.addEventListener("click", (e) => {
  if (e.target.closest(".delete-btn")) {
    const taskControl = e.target.closest(".task-control");
    deleteTodo(Number(taskControl.id));
  } else if (e.target.closest(".complete-btn")) {
    const taskControl = e.target.closest(".task-control");
    completeTodo(Number(taskControl.id), e);
  }
});

filterButtons.addEventListener("click", (e) => {
  if (e.target.classList.contains("all-btn")) {
    loadTodos(getTodosFromLocalStorage());
  } else if (e.target.classList.contains("completed-btn")) {
    let todos = getTodosFromLocalStorage();
    loadTodos(completedTodos(todos));
  } else if (e.target.classList.contains("pending-btn")) {
    let todos = getTodosFromLocalStorage();
    loadTodos(pendingTodos(todos));
  } else if (e.target.classList.contains("clearCompleted-btn")) {
    let todos = getTodosFromLocalStorage();
    setTodosInLocalStorage(pendingTodos(todos));
    loadTodos(getTodosFromLocalStorage());
  }
});

//*........... Functions ..............*\\

function setTodosInLocalStorage(todos) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
}
function getTodosFromLocalStorage() {
  return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
}

function loadTodos(storedTodos) {
  if (storedTodos) {
    todos = storedTodos;
    makeTodo(todos);
  }
  if (todos.length === 0) {
    noTask("No task yet.");
  }
}

function init() {
  let storedTodos = getTodosFromLocalStorage();
  loadTodos(storedTodos);
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  setTodosInLocalStorage(todos);
  loadTodos(todos);
}

function completeTodo(id, e) {
  const todo = todos.find((todo) => todo.id === id);

  if (todo) {
    todo.completed = !todo.completed;
    e.target
      .closest(".task")
      .classList.toggle(todo.completed ? "completed" : "none");
    setTodosInLocalStorage(todos);
    loadTodos(todos);
  }
}

function completedTodos(todos) {
  return todos.filter((todo) => todo.completed);
}
function pendingTodos(todos) {
  return todos.filter((todo) => !todo.completed);
}

function makeTodo(todos) {
  taskList.innerHTML = "";
  let completed = completedTodos(todos);
  let pending = pendingTodos(todos);
  todos = [...pending, ...completed];

  todos.forEach((todo) => {
    let task = document.createElement("div");
    task.classList.add("task", todo.completed ? "completed" : "none");

    // Create task top section
    let taskTop = document.createElement("div");
    taskTop.classList.add("task-top");

    let taskDate = document.createElement("div");
    taskDate.classList.add("task-date");

    let dateDiv = document.createElement("div");
    dateDiv.classList.add("date");
    dateDiv.textContent = `Date: ${todo.date}`;

    let timeDiv = document.createElement("div");
    timeDiv.classList.add("time");
    timeDiv.textContent = `Time: ${todo.time}`;

    taskDate.appendChild(dateDiv);
    taskDate.appendChild(timeDiv);
    taskTop.appendChild(taskDate);

    // Create task control section
    let taskControl = document.createElement("div");
    taskControl.classList.add("task-control");
    taskControl.id = todo.id;

    let completeBtn = document.createElement("button");
    completeBtn.classList.add("complete-btn");
    completeBtn.innerHTML = '<i class="ri-check-double-line"></i>';

    let deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.innerHTML = '<i class="ri-eraser-fill"></i>';

    taskControl.appendChild(completeBtn);
    taskControl.appendChild(deleteBtn);
    taskTop.appendChild(taskControl);
    task.appendChild(taskTop);

    // Create task info section
    let taskInfo = document.createElement("div");
    taskInfo.classList.add("task-info");

    let description = document.createElement("p");
    description.classList.add("task-description");
    description.textContent = todo.task; // Use textContent to prevent XSS

    taskInfo.appendChild(description);
    task.appendChild(taskInfo);
    taskList.appendChild(task);
  });
}

function noTask(text) {
  let task = document.createElement("div");
  task.classList.add("no-task");
  task.textContent = text;
  taskList.appendChild(task);
}

init();
