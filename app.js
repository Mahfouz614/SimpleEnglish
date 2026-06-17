// 1. Core Reactive System Variable Placeholders
let _currentTab, _setCurrentTab;
let _quizIndex, _setQuizIndex;
let _selectedQuizOpt, _setSelectedQuizOpt;
let _userProgress, _setUserProgress;
let _quizList, _setQuizList;

export function currentTab() { return _currentTab(); }
export function setCurrentTab(val) { _setCurrentTab(val); }
export function quizIndex() { return _quizIndex(); }
export function selectedQuizOpt() { return _selectedQuizOpt(); }
export function userProgress() { return _userProgress(); }
export function quizAnswered() { return _quizList(); }

export function getQuizzes(dataArray) {
  _setQuizList(dataArray);
}

// 2. Safe Boot Function (Initializes variables after SolidJS downloads completely)
export function initAppSignals() {
  const { createSignal, createEffect } = Solid;

  [_currentTab, _setCurrentTab] = createSignal('dashboard');
  [_quizIndex, _setQuizIndex] = createSignal(0);
  [_selectedQuizOpt, _setSelectedQuizOpt] = createSignal(null);
  [_quizList, _setQuizList] = createSignal([]);

  const initialProgress = { completedQuizzes: [], score: 0 };
  const [prog, setProg] = createSignal(JSON.parse(localStorage.getItem('learn_english_progress')) || initialProgress);
  _userProgress = prog; _setUserProgress = setProg;

  createEffect(() => {
    localStorage.setItem('learn_english_progress', JSON.stringify(_userProgress()));
  });
}

// 3. Audio Text-to-Speech Controller
export function speakText(phrase) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }
}

// 4. Interactive Quiz Scoring Rule Engine
export function handleQuizSelection(optionIndex, correctIndex) {
  _setSelectedQuizOpt(optionIndex);

  if (optionIndex === correctIndex) {
    speakText("Correct!");
    const current = _userProgress();
    if (!current.completedQuizzes.includes(_quizIndex())) {
      _setUserProgress({
        ...current,
        score: current.score + 10,
        completedQuizzes: [...current.completedQuizzes, _quizIndex()]
      });
    }
    
    // Auto-advance to next question if available after a brief pause
    setTimeout(() => {
      if (_quizIndex() < _quizList().length - 1) {
        _setQuizIndex(_quizIndex() + 1);
        _setSelectedQuizOpt(null);
      } else {
        speakText("Congratulations! You completed all exercises.");
      }
    }, 1200);

  } else {
    speakText("Try again!");
  }
}
