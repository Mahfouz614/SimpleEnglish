// 1. Destructure SolidJS features cleanly once
const { createSignal, createEffect } = Solid;

// 2. App State Navigation Signals
export const [currentTab, setCurrentTab] = createSignal('dashboard');
export const [quizIndex, setQuizIndex] = createSignal(0);
export const [exIndex, setExIndex] = createSignal(0);

// 3. Interactive UI State Signals
export const [quizAnswered, setQuizAnswered] = createSignal(false);
export const [exAnswered, setExAnswered] = createSignal(false);
export const [selectedQuizOpt, setSelectedQuizOpt] = createSignal(null);
export const [selectedExOpt, setSelectedExOpt] = createSignal(null);

// 4. Progress Storage Logic (JSON + LocalStorage)
const initialProgress = { completedQuizzes: [], completedExercises: [], score: 0 };

export const [userProgress, setUserProgress] = createSignal(
  JSON.parse(localStorage.getItem('learn_english_progress')) || initialProgress
);

createEffect(() => {
  localStorage.setItem('learn_english_progress', JSON.stringify(userProgress()));
});

// 5. Interaction Functions
export function speakText(phrase) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }
}

export function handleQuizSelection(optionIndex, correctIndex) {
  if (quizAnswered()) return;
  setSelectedQuizOpt(optionIndex);
  setQuizAnswered(true);

  if (optionIndex === correctIndex) {
    speakText("Correct!");
    const current = userProgress();
    if (!current.completedQuizzes.includes(quizIndex())) {
      setUserProgress({
        ...current,
        score: current.score + 10,
        completedQuizzes: [...current.completedQuizzes, quizIndex()]
      });
    }
  } else {
    speakText("Try again!");
  }
}
