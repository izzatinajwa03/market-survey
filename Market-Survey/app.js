// --- AUTH FUNCTIONS --- 
function signup() {
    let name = document.getElementById("su_user")?.value;
    let pass = document.getElementById("su_pass")?.value;
    if(!name || !pass) return alert("Please fill all fields");

    let users = JSON.parse(localStorage.getItem("local_users") || "[]");
    if(users.find(u => u.username === name)) return alert("Username exists.");

    users.push({ username: name, password: pass });
    localStorage.setItem("local_users", JSON.stringify(users));
    alert("Account created successfully!");
    window.location.href = 'login.html';
}

function login() {
    let user = document.getElementById("login_user")?.value;
    let pass = document.getElementById("login_pass")?.value;
    if(!user || !pass) return alert("Please fill all fields");

    let users = JSON.parse(localStorage.getItem("local_users") || "[]");
    let foundUser = users.find(u => u.username === user && u.password === pass);
    if(foundUser){
        localStorage.setItem("currentUser", user);
        window.location.href = 'dashboard.html';
    } else alert("Invalid username or password");
}

function logout() { localStorage.removeItem("currentUser"); }

// --- SURVEY FUNCTIONS ---
function saveIntroText() {
    const intro = document.getElementById("editableIntro");
    if(intro) {
        localStorage.setItem("introText", intro.innerHTML);
        alert("Introduction text saved!");
    }
}

function adjustSectionFontSize(elementId, size) {
    const target = document.getElementById(elementId);
    if (target) {
        target.style.fontSize = size + "px";
        localStorage.setItem("fontSize_" + elementId, size);
    }
}

// --- CUSTOM QUESTIONS ---
function addCustomQuestion(questionData = null) {
    const container = document.getElementById("customQuestionsContainer");
    if(!container) return;

    const qCount = container.children.length + 1; 
    const qDiv = document.createElement("div");
    qDiv.classList.add("custom-question-card");

    const questionText = questionData?.question || '';
    const type = questionData?.type || 'radio';
    const options = questionData?.options || [];

    qDiv.innerHTML = `
        <div class="card-controls">
            <div>
                <span class="q-number-label">Question ${qCount}</span>
                <select class="type-selector" onchange="toggleOptionUI(this)">
                    <option value="radio" ${type==='radio'?'selected':''}>🔘 Multiple Choice</option>
                    <option value="checkbox" ${type==='checkbox'?'selected':''}>✅ Checkbox</option>
                    <option value="text" ${type==='text'?'selected':''}>📝 Short Answer</option>
                    <option value="dropdown" ${type==='dropdown'?'selected':''}>🔽 Dropdown</option>
                    <option value="rating" ${type==='rating'?'selected':''}>⭐ Star Rating</option>
                    <option value="date" ${type==='date'?'selected':''}>📅 Date Picker</option>
                </select>
            </div>
        </div>
        <input type="text" placeholder="Enter your question here..." class="custom-input q-title" value="${questionText}">
        <div class="options-area" style="display: ${['radio', 'checkbox', 'dropdown'].includes(type) ? 'block' : 'none'}">
            <div class="options-container"></div>
            <button class="btn-secondary" onclick="addOption(this)">+ Add Option</button>
        </div>
    `;

    container.appendChild(qDiv);
    const containerOptions = qDiv.querySelector(".options-container");
    options.forEach(opt => addOption(qDiv.querySelector(".btn-secondary"), opt));

    if(!questionData && ['radio', 'checkbox', 'dropdown'].includes(type)) {
        addOption(qDiv.querySelector(".btn-secondary"));
    }
}

function removeLastQuestion() {
    const container = document.getElementById("customQuestionsContainer");
    if(container.lastChild) {
        container.removeChild(container.lastChild);
    }
}

function toggleOptionUI(select) {
    const optionsArea = select.closest('.custom-question-card').querySelector('.options-area');
    const needsOptions = ['radio', 'checkbox', 'dropdown'].includes(select.value);
    optionsArea.style.display = needsOptions ? 'block' : 'none';
}

// New Function for Text Formatting
function formatText(command) {
    document.execCommand(command, false, null);
}

// Updated addOption Function for better UI
function addOption(btn, val = '') {
    const container = btn.previousElementSibling;
    const optDiv = document.createElement("div");
    optDiv.className = "option-row";
    optDiv.innerHTML = `
        <input type="text" placeholder="Option text" class="custom-input" value="${val}">
        <button class="remove-opt" title="Remove Option" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(optDiv);
}

function renderCustomQuestions() {
    const displayContainer = document.getElementById("customQuestionsDisplay");
    if(!displayContainer) return;
    displayContainer.innerHTML = '';

    const savedQuestions = JSON.parse(localStorage.getItem("customQuestions") || "[]");
    savedQuestions.forEach((q, index) => {
        const qDiv = document.createElement("div");
        qDiv.classList.add("custom-question-display");
        qDiv.innerHTML = `
            <div class="q-display-header">
                <strong>Q${index+1}:</strong> 
                <span class="editable-question-text">${q.question}</span>
            </div>
            <div class="options-display" id="opt-display-${index}"></div>
        `;

        const optCont = qDiv.querySelector(".options-display");

        if(q.type === "text") {
            optCont.innerHTML = `<input type="text" class="custom-input" placeholder="User response...">`;
        } else if(q.type === "date") {
            optCont.innerHTML = `<input type="date" class="custom-input">`;
        } else if(q.type === "rating") {
            optCont.innerHTML = `<div class="star-rating" id="star-container-${index}">
                ${[1,2,3,4,5].map(num => `<span onclick="updateStarUI(${index}, ${num})">★</span>`).join('')}
            </div>`;
        } else if(q.type === "dropdown") {
            const opts = q.options.map(o => `<option value="${o}">${o}</option>`).join('');
            optCont.innerHTML = `<select><option>Select...</option>${opts}</select>`;
        } else {
            q.options.forEach(opt => {
                const item = document.createElement("label");
                item.style.display = "block"; 
                item.innerHTML = `<input type="${q.type}" name="q${index}" value="${opt}"> ${opt}`;
                optCont.appendChild(item);
            });
        }
        displayContainer.appendChild(qDiv);
    });
}

function updateStarUI(qIndex, rating) {
    const container = document.getElementById(`star-container-${qIndex}`);
    const stars = container.querySelectorAll('span');
    stars.forEach((star, i) => {
        star.classList.toggle('active', i < rating);
    });
}

function saveCustomQuestions() {
    const container = document.getElementById("customQuestionsContainer");
    if(!container) return;

    const data = [];
    Array.from(container.children).forEach(card => {
        const questionText = card.querySelector('.q-title')?.value || '';
        const type = card.querySelector('.type-selector')?.value || 'text';
        const options = Array.from(card.querySelectorAll('.options-container input')).map(i => i.value).filter(v => v !== '');
        data.push({ question: questionText, type, options, selected: [] });
    });
    localStorage.setItem("customQuestions", JSON.stringify(data));
    alert("Survey Structure Saved!");
    renderCustomQuestions();
}

// --- PAGE INIT ---
window.onload = function() {
    const userEl = document.getElementById("user");
    if(userEl) userEl.innerText = localStorage.getItem("currentUser") || "Guest";

    const savedText = localStorage.getItem("introText");
    const introEl = document.getElementById("editableIntro");
    if(savedText && introEl) introEl.innerHTML = savedText;

    // ADD THIS LOOP TO LOAD SAVED FONT SIZES
    const adjustableIds = ['editableIntro', 'q1Area', 'q2Area', 'q3Area'];
    adjustableIds.forEach(id => {
        const savedSize = localStorage.getItem("fontSize_" + id);
        const element = document.getElementById(id);
        if (savedSize && element) {
            element.style.fontSize = savedSize + "px";
            // Also update the slider position to match the saved size
            const slider = element.closest('.section-card').querySelector('input[type="range"]');
            if (slider) slider.value = savedSize;
        }
    });

    const savedQuestions = JSON.parse(localStorage.getItem("customQuestions") || "[]");
    if(savedQuestions.length > 0) {
        savedQuestions.forEach(q => addCustomQuestion(q));
    }
    renderCustomQuestions();
    
    // Fill countries
    const countryDropdown = document.getElementById("countryDropdown");
    if(countryDropdown){
        const countries = ["Malaysia", "Afghanistan","Albania","Algeria", "Australia", "USA","UK"];
        countries.forEach(c => countryDropdown.innerHTML += `<option value="${c}">${c}</option>`);
    }
}

let myChart; // Global variable to store the chart instance

function initResponseChart(type = 'pie') {
    const ctx = document.getElementById('responsesChart');
    if (!ctx) return;

    // Destroy existing chart if it exists to prevent overlap
    if (myChart) myChart.destroy();

    // Mock Data (In a real app, you'd fetch this from localStorage/Database)
    const dataValues = [45, 25, 20, 10];
    const labels = ['Government', 'Private Sector', 'Education', 'Self-Employed'];

    myChart = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: 'Organization Type',
                data: dataValues,
                backgroundColor: [
                    '#673ab7', // Primary
                    '#ff4081', // Accent
                    '#4caf50', // Green
                    '#ff9800'  // Orange
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function updateChartType(newType) {
    initResponseChart(newType);
}

// Update your existing window.onload to include chart init
const originalOnload = window.onload;
window.onload = function() {
    if (originalOnload) originalOnload();
    if (document.getElementById('responsesChart')) {
        initResponseChart('pie');
    }
};

function copyLink() {
    const dummy = document.createElement('input');
    const text = window.location.href;
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    alert('Survey link copied to clipboard!');
}