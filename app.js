// Global Application State Containers
let appLessons = [];
let appQuizzes = [];
let globalSelectedQuizIndex = 0;
let activeQuizAnsweredState = false;

// 1. CHAT AI ASSISTANT LAYERS (Runs instantly)
function processAIEngineRequest() {
    const field = document.getElementById('chat-input-field');
    const statement = field ? field.value.trim() : "";
    if (!statement) return;

    const cleanStr = statement.toLowerCase();
    const logWindow = document.getElementById('chat-window-viewport');

    logWindow.innerHTML += `
        <div class="flex items-start space-x-2.5 justify-end animate-fade-in">
            <div class="bg-purple-50 border border-purple-200 text-purple-950 rounded-2xl rounded-tr-none p-3.5 max-w-[85%] font-medium shadow-sm">${statement}</div>
            <div class="bg-purple-100 text-purple-700 font-bold text-xs h-7 w-7 rounded-xl flex items-center justify-center shrink-0 border border-purple-200 shadow-sm">ME</div>
        </div>
    `;
    
    field.value = '';
    logWindow.scrollTop = logWindow.scrollHeight;

    let answerText = "That's an interesting language question! Try asking me about 'spelling beautiful', 'difference between speak and talk', or 'past tense'.";
    
    if (cleanStr.includes("spell") && cleanStr.includes("beautiful")) {
        answerText = "The perfect spelling is <strong>B-E-A-U-T-I-F-U-L</strong>.";
    } else if (cleanStr.includes("speak") || cleanStr.includes("talk")) {
        answerText = "<strong>Speak:</strong> Used for languages or formal things.<br><strong>Talk:</strong> Used for everyday friendly conversation.";
    } else if (cleanStr.includes("past") || cleanStr.includes("yesterday")) {
        answerText = "Add <strong>-ed</strong> to standard verbs. E.g., Cook ➡️ Cooked.";
    }

    setTimeout(() => {
        logWindow.innerHTML += `
            <div class="flex items-start space-x-2.5 animate-fade-in">
                <div class="bg-purple-600 text-white font-black text-xxs h-7 w-7 rounded-xl flex items-center justify-center shrink-0 shadow-md">AI</div>
                <div class="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 max-w-[85%] text-slate-700 shadow-sm">${answerText}</div>
            </div>
        `;
        logWindow.scrollTop = logWindow.scrollHeight;
    }, 300);
}

// Speech Audio Engine
function speakText(phrase) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const item = new SpeechSynthesisUtterance(phrase);
        item.lang = 'en-US';
        item.rate = 0.9;
        window.speechSynthesis.speak(item);
    }
}

// 2. CORE TABS ROUTER LAYER
function switchTab(tabId) {
    const tabsList = ['dashboard', 'lessons', 'quiz', 'ai'];
    tabsList.forEach(id => {
        const tabEl = document.getElementById(`tab-${id}`);
        const navEl = document.getElementById(`nav-${id}`);
        if (tabEl) tabEl.classList.add('hidden');
        if (navEl) navEl.className = "px-4 py-2 rounded-lg text-slate-600 hover:text-indigo-600 transition-all duration-200";
    });

    const activeTab = document.getElementById(`tab-${tabId}`);
    if (activeTab) activeTab.classList.remove('hidden');
    
    const activeNav = document.getElementById(`nav-${tabId}`);
    if (activeNav) {
        activeNav.className = (tabId === 'ai') 
            ? "px-4 py-2 rounded-lg text-purple-600 bg-purple-50 shadow-sm border border-purple-100 font-bold" 
            : "px-4 py-2 rounded-lg text-indigo-600 bg-white shadow-sm border border-slate-100 font-bold";
    }
}

// 3. CURRICULUM SYLLABUS LESSON RENDERER
function filterContent(levelFilterKey) {
    const btnBeginner = document.getElementById('btn-filter-beginner');
    const btnIntermediate = document.getElementById('btn-filter-intermediate');
    const btnAdvanced = document.getElementById('btn-filter-advanced');
    
    if (btnBeginner && btnIntermediate && btnAdvanced) {
        [btnBeginner, btnIntermediate, btnAdvanced].forEach(b => b.className = "px-3 py-1.5 rounded-lg text-slate-500 transition");
        const activeBtn = document.getElementById(`btn-filter-${levelFilterKey}`);
        if (activeBtn) activeBtn.className = "px-3 py-1.5 rounded-lg bg-white shadow-sm text-slate-800 font-bold";
    }

    const gridContainer = document.getElementById('lessons-render-grid');
    if (!gridContainer) return;
    gridContainer.innerHTML = '';

    const filteredArray = appLessons.filter(l => l.level === levelFilterKey);
    
    if(filteredArray.length === 0) {
        gridContainer.innerHTML = `<p class="text-slate-400 text-sm italic">No data found inside your json file for level: ${levelFilterKey}</p>`;
        return;
    }

    filteredArray.forEach(item => {
        const elementRow = document.createElement('div');
        elementRow.className = "bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-slate-300 transform hover:scale-[1.005] transition duration-200 animate-fade-in";
        elementRow.innerHTML = `
            <div class="space-y-1 max-w-xl">
                <div class="flex items-center space-x-2">
                    <span class="text-xs font-black px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">Lesson ${item.id}</span>
                    <span class="text-xs font-bold text-indigo-600">${item.highlight || 'Vocabulary'}</span>
                </div>
                <h4 class="font-black text-slate-900 text-lg">${item.title}</h4>
                <p class="text-xs text-slate-600 leading-relaxed">${item.text}</p>
                <p class="text-xs text-indigo-600 font-medium italic mt-1 bg-indigo-50/50 px-2.5 py-1 rounded-md border border-indigo-100/30 w-fit">"${item.sample}"</p>
            </div>
            <button onclick="speakText('${item.sample.replace(/'/g, "\\'")}')" class="h-11 w-11 rounded-xl bg-slate-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-200 flex items-center justify-center shrink-0 border border-slate-200/60 shadow-sm">
                <i class="fa-solid fa-volume-high text-sm"></i>
            </button>
        `;
        gridContainer.appendChild(elementRow);
    });
}

// 4. ASSESSMENT SYSTEM (QUIZ RUNNER)
function initializeQuizInterfaceModule() {
    const indexGrid = document.getElementById('quiz-badge-grid');
    if (!indexGrid || appQuizzes.length === 0) return;
    indexGrid.innerHTML = '';

    appQuizzes.forEach((quizItem, idx) => {
        const badgeButton = document.createElement('button');
        badgeButton.id = `quiz-selection-node-idx-${idx}`;
        badgeButton.className = "p-2 text-center rounded-xl font-bold border text-xs shadow-sm cursor-pointer transition border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
        badgeButton.innerText = idx + 1;
        badgeButton.onclick = () => renderQuizScreenIndexRecord(idx);
        indexGrid.appendChild(badgeButton);
    });
    renderQuizScreenIndexRecord(0);
}

function renderQuizScreenIndexRecord(targetIndexPointer) {
    if (appQuizzes.length === 0) return;
    globalSelectedQuizIndex = targetIndexPointer;
    activeQuizAnsweredState = false;

    const actionRow = document.getElementById('active-quiz-actions-bar');
    if (actionRow) actionRow.classList.add('hidden');

    appQuizzes.forEach((_, idx) => {
        const el = document.getElementById(`quiz-selection-node-idx-${idx}`);
        if(el) el.className = "p-2 text-center rounded-xl font-bold border text-xs shadow-sm border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
    });
    
    const activeNode = document.getElementById(`quiz-selection-node-idx-${targetIndexPointer}`);
    if(activeNode) activeNode.className = "p-2 text-center rounded-xl font-black border text-xs shadow-md border-indigo-600 bg-indigo-600 text-white";

    const data = appQuizzes[targetIndexPointer];
    document.getElementById('active-quiz-badge-id').innerText = `Quiz ${targetIndexPointer + 1}`;
    document.getElementById('active-quiz-difficulty-label').innerText = `Difficulty: ${data.difficulty || 'Standard'}`;
    document.getElementById('active-quiz-prompt').innerText = data.q;

    const box = document.getElementById('active-quiz-alternatives-group');
    if (!box) return;
    box.innerHTML = '';

    data.options.forEach((alternativeText, optionIndex) => {
        const optBtn = document.createElement('button');
        optBtn.className = "w-full text-left p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80 transition-all text-sm font-semibold flex justify-between items-center outline-none";
        optBtn.innerHTML = `<span>${alternativeText}</span><i class="fa-regular fa-circle text-slate-300"></i>`;
        
        optBtn.onclick = () => {
            if(activeQuizAnsweredState) return;
            activeQuizAnsweredState = true;

            const activeOptionElements = box.getElementsByTagName('button');
            for(let b of activeOptionElements) b.disabled = true;

            if(optionIndex === data.correct) {
                optBtn.className = "w-full text-left p-3.5 rounded-xl border border-emerald-500 bg-emerald-50 text-emerald-900 font-bold text-sm flex justify-between items-center";
                optBtn.innerHTML = `<span>${alternativeText}</span><i class="fa-solid fa-circle-check text-emerald-600"></i>`;
                document.getElementById('quiz-correct-feedback-str').innerText = "✨ Correct Answer!";
                speakText("Correct!");
            } else {
                optBtn.className = "w-full text-left p-3.5 rounded-xl border border-rose-500 bg-rose-50 text-rose-900 font-bold text-sm flex justify-between items-center";
                optBtn.innerHTML = `<span>${alternativeText}</span><i class="fa-solid fa-circle-xmark text-rose-600"></i>`;
                
                activeOptionElements[data.correct].className = "w-full text-left p-3.5 rounded-xl border border-emerald-500 bg-emerald-50 text-emerald-900 font-bold text-sm flex justify-between items-center";
                activeOptionElements[data.correct].innerHTML = `<span>${data.options[data.correct]}</span><i class="fa-solid fa-circle-check text-emerald-600"></i>`;
                document.getElementById('quiz-correct-feedback-str').innerText = "Keep trying!";
            }
            if (actionRow) actionRow.classList.remove('hidden');
        };
        box.appendChild(optBtn);
    });
}

function triggerQuizNextAutoSequence() {
    const indexValue = (globalSelectedQuizIndex + 1) % appQuizzes.length;
    renderQuizScreenIndexRecord(indexValue);
}

// 5. ASYNC INITIALIZER ENGINE (Loads the local data.json file)
async function startApplicationEngine() {
    try {
        // Read data.json file directly from the same GitHub directory
        const systemResponse = await fetch('data.json');
        const database = await systemResponse.json();
        
        // Match JSON fields (Check for plural or singular namings)
        appLessons = database.lessons || database.lesson || [];
        appQuizzes = database.quizzes || database.quiz || [];
        
        console.log("Database connected successfully:", appLessons.length, "Lessons", appQuizzes.length, "Quizzes");

        // First render pass layout
        filterContent('beginner');
        initializeQuizInterfaceModule();
    } catch (error) {
        console.error("Critical: Could not read data.json. Check file placement.", error);
        const grid = document.getElementById('lessons-render-grid');
        if (grid) grid.innerHTML = `<p class="text-rose-500 text-xs p-4">Error loading data.json database. Make sure data.json exists in your repo!</p>`;
    }
}

// Wire input chat box listening key events
document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.getElementById('chat-input-field');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') processAIEngineRequest(); });
    }
});

// Fire up the engine when windows load completely
window.onload = () => {
    switchTab('dashboard');
    startApplicationEngine();
};
