/**
 * LearnEnglish Core Quiz Engine
 */
document.addEventListener('DOMContentLoaded', () => {
    // Frozen Bank Dataset to prevent runtime tampering
    const quizBank = Object.freeze([
        {
            id: 1,
            question: "Which sentence uses the present perfect tense correctly?",
            options: [
                "I have gone to Paris last summer.",
                "I went to Paris three times.",
                "I have been to Paris twice.",
                "I am going to Paris yesterday."
            ],
            correctIndex: 2
        },
        {
            id: 2,
            question: "Choose the correct word: 'The company decided to ____ its workforce.'",
            options: ["expand", "expend", "extent", "expense"],
            correctIndex: 0
        },
        {
            id: 3,
            question: "What is the antonym of the word 'Meticulous'?",
            options: ["Careful", "Careless", "Detailed", "Strict"],
            correctIndex: 1
        }
    ]);

    let currentQuestionIndex = 0;
    let score = 0;
    let selectedOptionIndex = null;

    // DOM Elements
    const questionNumText = document.getElementById('question-number');
    const progressBar = document.getElementById('progress');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');
    const quizBody = document.getElementById('quiz-body');
    const resultContainer = document.getElementById('result-container');
    const scoreDisplay = document.getElementById('score-display');
    const retryBtn = document.getElementById('retry-btn');

    function loadQuestion() {
        if (!SecurityEngine.validateState(currentQuestionIndex, quizBank.length)) return;

        // Reset button states
        selectedOptionIndex = null;
        submitBtn.classList.add('disabled');
        submitBtn.disabled = true;
        submitBtn.classList.remove('hidden');
        nextBtn.classList.add('hidden');

        const currentQuiz = quizBank[currentQuestionIndex];
        
        // Securely inject content using textContent (Stops XSS cold)
        questionNumText.textContent = `Question ${currentQuestionIndex + 1} of ${quizBank.length}`;
        progressBar.style.width = `${((currentQuestionIndex) / quizBank.length) * 100}%`;
        questionText.textContent = currentQuiz.question;

        // Clear dynamic elements safely
        optionsContainer.innerHTML = '';

        currentQuiz.options.forEach((option, idx) => {
            const button = document.createElement('button');
            button.classList.add('option-btn');
            // Sanitize string data before assigning
            button.textContent = SecurityEngine.sanitize(option);
            button.dataset.index = idx;
            
            button.addEventListener('click', () => selectOption(idx, button));
            optionsContainer.appendChild(button);
        });
    }

    function selectOption(index, element) {
        if (submitBtn.classList.contains('hidden')) return; // Option locked after submission

        selectedOptionIndex = index;
        
        // Remove selection from others
        document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
        element.classList.add('selected');

        submitBtn.classList.remove('disabled');
        submitBtn.disabled = false;
    }

    function submitAnswer() {
        if (selectedOptionIndex === null) return;

        const currentQuiz = quizBank[currentQuestionIndex];
        const options = document.querySelectorAll('.option-btn');

        options.forEach((btn, idx) => {
            btn.disabled = true; // Lock choice
            if (idx === currentQuiz.correctIndex) {
                btn.classList.add('correct');
            } else if (idx === selectedOptionIndex) {
                btn.classList.add('incorrect');
            }
        });

        if (selectedOptionIndex === currentQuiz.correctIndex) {
            score++;
        }

        submitBtn.classList.add('hidden');
        nextBtn.classList.remove('hidden');
    }

    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < quizBank.length) {
            loadQuestion();
        } else {
            showResults();
        }
    }

    function showResults() {
        quizBody.parentElement.classList.add('hidden');
        resultContainer.classList.remove('hidden');
        
        const finalPercentage = Math.round((score / quizBank.length) * 100);
        scoreDisplay.textContent = SecurityEngine.sanitize(finalPercentage.toString());
        progressBar.style.width = '100%';
    }

    function resetQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        resultContainer.classList.add('hidden');
        quizBody.parentElement.classList.remove('hidden');
        loadQuestion();
    }

    // Attach Event Listeners
    submitBtn.addEventListener('click', submitAnswer);
    nextBtn.addEventListener('click', nextQuestion);
    retryBtn.addEventListener('click', resetQuiz);

    // Initial Engine Kickoff
    loadQuestion();
});
