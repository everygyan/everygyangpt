import source from "./german-a1-source.json";
import type { GermanExercise, GermanLesson } from "./german-course";

const units = ["Your first conversations", "Numbers and identity", "People and things", "Build your sentences", "Time and daily life", "Food and shopping", "Home and neighbourhood", "Travel with confidence", "Everyday situations", "Work, messages and your final mission"];

function question(raw: (string | number | string[])[]): GermanExercise {
  return { prompt: String(raw[0]), choices: raw[1] as string[], answer: Number(raw[2]), explanation: String(raw[3]) };
}

export const germanA1Lessons: GermanLesson[] = source.map((lesson, index) => {
  const phrases = lesson.phrases.map(([german, english]) => ({ german, english }));
  const translationQuestions = phrases.slice(0, 3).map((phrase, i): GermanExercise => {
    const answer = (index + i) % 3;
    const choices = [phrases[(i + 1) % 5].english, phrases[(i + 2) % 5].english];
    choices.splice(answer, 0, phrase.english);
    return { prompt: `What does “${phrase.german}” mean?`, choices, answer, explanation: `“${phrase.german}” means “${phrase.english}”. Read the example aloud, then use it in your own sentence.` };
  });
  const exercises = [...translationQuestions, question(lesson.quiz), question(lesson.readingQuiz)];
  return {
    slug: lesson.slug, level: "A1", unit: units[Math.floor(index / 5)], unitOrder: Math.floor(index / 5) + 1,
    lessonOrder: index % 5 + 1, title: lesson.title, description: lesson.goal,
    icon: ["💬", "🔢", "🏠", "🧩", "⏰", "☕", "🛋️", "🚆", "🤝", "🎓"][Math.floor(index / 5)],
    minutes: 20, xp: 20, phrases, exercise: exercises[0], exercises,
    notes: lesson.notes, dialogue: lesson.dialogue.map(([speaker, german, english]) => ({ speaker, german, english })),
    task: lesson.task, model: lesson.model,
    pdfUrl: `/resources/german-a1/${lesson.slug}.pdf`,
  };
});
