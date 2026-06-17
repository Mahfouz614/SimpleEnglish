// 1. App State Navigation Signals
let _currentTab, _setCurrentTab;
let _quizIndex, _setQuizIndex;
let _quizAnswered, _setQuizAnswered;
let _selectedQuizOpt, _setSelectedQuizOpt;
let _userProgress, _setUserProgress;

export function currentTab() { return _currentTab(); }
export function setCurrentTab(val) { _setCurrentTab(val); }
export function quizIndex() { return _quizIndex(); }
export function quizAnswered() { return _quizAnswered(); }
export function selectedQuizOpt() { return _selectedQuizOpt(); }
export function userProgress() { return _userProgress(); }

// Initializes our reactive state signals safely after SolidJS loads
export function initAppSignals() {
  const { createSignal, createEffect } = Solid;

  [_currentTab, _setCurrentTab] = createSignal('dashboard');
  [_quizIndex, _setQuizIndex] = createSignal(0);
  [_quizAnswered, _setQuizAnswered] = createSignal(false);
  [_selectedQuizOpt, _setSelectedQuizOpt] = createSignal(null);

  const initialProgress = { completedQuizzes: [], completedExercises: [], score: 0 };
  const [prog, setProg] = createSignal(JSON.parse(localStorage.getItem('learn_english_progress')) || initialProgress);
  _userProgress = prog; _setUserProgress = setProg;

  createEffect(() => {
    localStorage.setItem('learn_english_progress', JSON.stringify(_userProgress()));
  });
}

// 2. Audio Text-to-Speech Controller
export function speakText(phrase) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }
}

// 3. Game Logic Handler
export function handleQuizSelection(optionIndex, correctIndex) {
  if (_quizAnswered()) return;
  _setSelectedQuizOpt(optionIndex);
  _setQuizAnswered(true);

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
  } else {
    speakText("Try again!");
  }
}
