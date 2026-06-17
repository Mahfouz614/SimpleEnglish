// 1. App State Navigation Signals (Initialized lazily once Solid loads)
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

// This function safely boots up our signals after the browser loads SolidJS
export function initAppSignals() {
  const { createSignal, createEffect } = Solid;

  [_currentTab, _setCurrentTab] = createSignal('dashboard');
  [_quizIndex, _setQuizIndex] = createSignal(0);
  [_quizAnswered, _setQuizAnswered] = createSignal(false);
  [_selectedQuizOpt, _setSelectedQuizOpt] = createSignal(null);

  const initialProgress = { completedQuizzes: [], completedExercises: [], score: 0 };
  [_userProgress, _setUserProgress] = createSignal(
    JSON.parse(localStorage.getItem('learn_english_progress')) || initialProgress
  );

  createEffect(() => {
    localStorage.setItem('learn_english_progress', JSON.stringify(_userProgress()));
  });
}

// 2. Interaction Functions
export function speakText(phrase) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }
}

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
