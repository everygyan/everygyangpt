export type GermanExercise = {
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
};

export type GermanLesson = {
  slug: string;
  level: GermanLevelCode;
  unit: string;
  unitOrder: number;
  lessonOrder: number;
  title: string;
  description: string;
  icon: string;
  minutes: number;
  xp: number;
  phrases: { german: string; english: string }[];
  exercise: GermanExercise;
};

export type GermanLevelCode = "A1" | "A2" | "B1" | "B2" | "C1";

export type GermanLevel = {
  code: GermanLevelCode;
  title: string;
  description: string;
  outcome: string;
  color: string;
  order: number;
};

export type GermanResource = {
  level: GermanLevelCode | "ALL";
  title: string;
  provider: string;
  description: string;
  url: string;
  kind: string;
};

export type GermanCourseCatalog = {
  levels: GermanLevel[];
  lessons: GermanLesson[];
  resources: GermanResource[];
};

export const germanLevels: GermanLevel[] = [
  { code: "A1", title: "First steps", description: "Meet people, introduce yourself and handle simple daily situations.", outcome: "Understand and use familiar everyday expressions.", color: "#1cb0f6", order: 1 },
  { code: "A2", title: "Everyday German", description: "Talk about routines, travel, shopping and the world around you.", outcome: "Communicate in common, predictable situations.", color: "#58cc02", order: 2 },
  { code: "B1", title: "Independent speaker", description: "Tell stories, explain plans and deal with life in a German-speaking country.", outcome: "Handle most situations while travelling or living independently.", color: "#ffb020", order: 3 },
  { code: "B2", title: "Confident conversation", description: "Discuss ideas, understand detailed texts and express clear viewpoints.", outcome: "Interact fluently and argue a position with detail.", color: "#ff6b35", order: 4 },
  { code: "C1", title: "Advanced expression", description: "Use flexible, precise German for study, work and complex topics.", outcome: "Understand demanding content and communicate spontaneously.", color: "#8b5cf6", order: 5 },
];

export const germanLessons: GermanLesson[] = [
  {
    slug: "a1-greetings", level: "A1", unit: "Meet and greet", unitOrder: 1, lessonOrder: 1,
    title: "Hello, Germany!", description: "Greet someone and say goodbye.", icon: "👋", minutes: 5, xp: 10,
    phrases: [{ german: "Guten Morgen!", english: "Good morning!" }, { german: "Wie geht es dir?", english: "How are you?" }, { german: "Auf Wiedersehen!", english: "Goodbye!" }],
    exercise: { prompt: "Which phrase means ‘Good morning’ ?", choices: ["Gute Nacht", "Guten Morgen", "Bis später"], answer: 1, explanation: "‘Guten Morgen’ is used in the morning; later in the day you can say ‘Guten Tag’." },
  },
  {
    slug: "a1-introductions", level: "A1", unit: "Meet and greet", unitOrder: 1, lessonOrder: 2,
    title: "Introduce yourself", description: "Share your name and where you come from.", icon: "🙂", minutes: 6, xp: 10,
    phrases: [{ german: "Ich heiße Sandeep.", english: "My name is Sandeep." }, { german: "Ich komme aus Indien.", english: "I come from India." }, { german: "Freut mich!", english: "Nice to meet you!" }],
    exercise: { prompt: "Complete: Ich ___ aus Indien.", choices: ["komme", "heiße", "wohne"], answer: 0, explanation: "‘kommen aus’ expresses where somebody comes from." },
  },
  {
    slug: "a1-cafe", level: "A1", unit: "Daily essentials", unitOrder: 2, lessonOrder: 1,
    title: "At the café", description: "Order politely and ask for the bill.", icon: "☕", minutes: 7, xp: 12,
    phrases: [{ german: "Ich möchte einen Kaffee, bitte.", english: "I would like a coffee, please." }, { german: "Sonst noch etwas?", english: "Anything else?" }, { german: "Die Rechnung, bitte.", english: "The bill, please." }],
    exercise: { prompt: "How do you politely ask for the bill?", choices: ["Die Rechnung, bitte.", "Wo ist der Bahnhof?", "Ich bin müde."], answer: 0, explanation: "‘bitte’ makes the request polite." },
  },
  {
    slug: "a2-routine", level: "A2", unit: "My day", unitOrder: 1, lessonOrder: 1,
    title: "Daily routine", description: "Describe what happens during your day.", icon: "⏰", minutes: 7, xp: 14,
    phrases: [{ german: "Ich stehe um sieben Uhr auf.", english: "I get up at seven o’clock." }, { german: "Danach fahre ich zur Arbeit.", english: "After that I travel to work." }, { german: "Abends koche ich gern.", english: "In the evening I like cooking." }],
    exercise: { prompt: "Which word means ‘after that’ ?", choices: ["zuerst", "danach", "gestern"], answer: 1, explanation: "‘danach’ connects events in sequence." },
  },
  {
    slug: "a2-directions", level: "A2", unit: "Out and about", unitOrder: 2, lessonOrder: 1,
    title: "Find your way", description: "Ask for and understand simple directions.", icon: "🗺️", minutes: 8, xp: 14,
    phrases: [{ german: "Wie komme ich zum Bahnhof?", english: "How do I get to the station?" }, { german: "Gehen Sie geradeaus.", english: "Go straight ahead." }, { german: "Dann links an der Ampel.", english: "Then left at the traffic light." }],
    exercise: { prompt: "What does ‘geradeaus’ mean?", choices: ["to the right", "straight ahead", "behind"], answer: 1, explanation: "‘geradeaus gehen’ means to continue straight ahead." },
  },
  {
    slug: "a2-shopping", level: "A2", unit: "Out and about", unitOrder: 2, lessonOrder: 2,
    title: "Shopping smart", description: "Ask about sizes, prices and preferences.", icon: "🛍️", minutes: 7, xp: 14,
    phrases: [{ german: "Wie viel kostet das?", english: "How much does that cost?" }, { german: "Haben Sie das in Größe M?", english: "Do you have that in size M?" }, { german: "Das gefällt mir.", english: "I like that." }],
    exercise: { prompt: "Choose the question about price.", choices: ["Wie viel kostet das?", "Welche Größe tragen Sie?", "Kann ich helfen?"], answer: 0, explanation: "‘wie viel’ asks how much or how many." },
  },
  {
    slug: "b1-past-events", level: "B1", unit: "Tell your story", unitOrder: 1, lessonOrder: 1,
    title: "What happened?", description: "Talk about experiences using the conversational past.", icon: "📖", minutes: 9, xp: 18,
    phrases: [{ german: "Ich habe Berlin besucht.", english: "I visited Berlin." }, { german: "Wir sind früh angekommen.", english: "We arrived early." }, { german: "Es hat mir sehr gefallen.", english: "I liked it very much." }],
    exercise: { prompt: "Which auxiliary belongs with ‘angekommen’ ?", choices: ["haben", "sein", "werden"], answer: 1, explanation: "Movement and change-of-state verbs commonly form the Perfekt with ‘sein’." },
  },
  {
    slug: "b1-opinions", level: "B1", unit: "Express yourself", unitOrder: 2, lessonOrder: 1,
    title: "Give your opinion", description: "Agree, disagree and explain a reason.", icon: "💬", minutes: 9, xp: 18,
    phrases: [{ german: "Meiner Meinung nach …", english: "In my opinion …" }, { german: "Ich stimme dir zu.", english: "I agree with you." }, { german: "Da bin ich anderer Meinung.", english: "I have a different opinion about that." }],
    exercise: { prompt: "Which phrase politely signals disagreement?", choices: ["Genau!", "Da bin ich anderer Meinung.", "Das weiß ich nicht."], answer: 1, explanation: "It states disagreement neutrally and is useful in discussions." },
  },
  {
    slug: "b1-plans", level: "B1", unit: "Express yourself", unitOrder: 2, lessonOrder: 2,
    title: "Plans and possibilities", description: "Discuss goals, wishes and conditions.", icon: "🎯", minutes: 10, xp: 20,
    phrases: [{ german: "Ich würde gern in Deutschland studieren.", english: "I would like to study in Germany." }, { german: "Wenn ich Zeit habe, lerne ich Deutsch.", english: "When I have time, I learn German." }, { german: "Mein Ziel ist, fließend zu sprechen.", english: "My goal is to speak fluently." }],
    exercise: { prompt: "Which form makes a wish sound polite?", choices: ["ich werde", "ich würde gern", "ich musste"], answer: 1, explanation: "‘würde gern’ is a common polite way to express a wish." },
  },
  {
    slug: "b2-arguments", level: "B2", unit: "Build an argument", unitOrder: 1, lessonOrder: 1,
    title: "Pros and cons", description: "Structure a balanced argument clearly.", icon: "⚖️", minutes: 11, xp: 22,
    phrases: [{ german: "Einerseits …, andererseits …", english: "On the one hand …, on the other hand …" }, { german: "Ein wesentlicher Vorteil besteht darin, dass …", english: "A key advantage is that …" }, { german: "Dagegen spricht jedoch, dass …", english: "However, an argument against it is that …" }],
    exercise: { prompt: "Which pair contrasts two sides of an issue?", choices: ["weder … noch", "einerseits … andererseits", "sowohl … als auch"], answer: 1, explanation: "The paired connector frames contrasting perspectives." },
  },
  {
    slug: "b2-relative-clauses", level: "B2", unit: "Precision", unitOrder: 2, lessonOrder: 1,
    title: "Add precise detail", description: "Connect information with relative clauses.", icon: "🔗", minutes: 10, xp: 22,
    phrases: [{ german: "Das ist die Stadt, in der ich lebe.", english: "That is the city in which I live." }, { german: "Der Kurs, den ich besuche, ist anspruchsvoll.", english: "The course I attend is demanding." }, { german: "Menschen, die viel lesen, erweitern ihren Wortschatz.", english: "People who read a lot expand their vocabulary." }],
    exercise: { prompt: "Complete: Das ist die Stadt, in ___ ich lebe.", choices: ["den", "der", "das"], answer: 1, explanation: "‘in’ describes location here, so it takes dative; ‘die Stadt’ becomes ‘der’." },
  },
  {
    slug: "b2-workplace", level: "B2", unit: "Precision", unitOrder: 2, lessonOrder: 2,
    title: "Professional German", description: "Communicate clearly in meetings and email.", icon: "💼", minutes: 12, xp: 24,
    phrases: [{ german: "Könnten Sie das bitte näher erläutern?", english: "Could you please explain that in more detail?" }, { german: "Ich fasse die Ergebnisse kurz zusammen.", english: "I’ll briefly summarise the results." }, { german: "Für Rückfragen stehe ich gern zur Verfügung.", english: "I am happy to answer any questions." }],
    exercise: { prompt: "Which sentence is appropriate at the end of a formal email?", choices: ["Bis dann!", "Für Rückfragen stehe ich gern zur Verfügung.", "Was meinst du?"], answer: 1, explanation: "It is a conventional, professional offer to answer follow-up questions." },
  },
  {
    slug: "c1-nuance", level: "C1", unit: "Nuance and style", unitOrder: 1, lessonOrder: 1,
    title: "Say exactly what you mean", description: "Choose precise language and soften claims.", icon: "🎨", minutes: 13, xp: 28,
    phrases: [{ german: "Es lässt sich kaum bestreiten, dass …", english: "It can hardly be denied that …" }, { german: "Das trifft nur bedingt zu.", english: "That is only partly true." }, { german: "Unter Umständen könnte …", english: "Under certain circumstances … could …" }],
    exercise: { prompt: "Which phrase limits a claim rather than fully rejecting it?", choices: ["Das trifft nur bedingt zu.", "Das ist völlig falsch.", "Das steht außer Frage."], answer: 0, explanation: "‘nur bedingt’ adds nuance by saying something is true only under limitations." },
  },
  {
    slug: "c1-nominal-style", level: "C1", unit: "Academic and formal German", unitOrder: 2, lessonOrder: 1,
    title: "Formal written style", description: "Recognise compact nominal structures in formal texts.", icon: "🧠", minutes: 14, xp: 30,
    phrases: [{ german: "Nach Abschluss der Untersuchung …", english: "After completion of the investigation …" }, { german: "Die Umsetzung der Maßnahmen …", english: "The implementation of the measures …" }, { german: "Unter Berücksichtigung aller Faktoren …", english: "Taking all factors into account …" }],
    exercise: { prompt: "Which option has the most formal nominal style?", choices: ["Nachdem wir alles geprüft hatten …", "Nach Abschluss der Prüfung …", "Als wir mit dem Prüfen fertig waren …"], answer: 1, explanation: "Formal German often condenses actions into noun phrases such as ‘nach Abschluss’." },
  },
  {
    slug: "c1-discussion", level: "C1", unit: "Academic and formal German", unitOrder: 2, lessonOrder: 2,
    title: "Lead a complex discussion", description: "Intervene, clarify and synthesise viewpoints.", icon: "🗣️", minutes: 14, xp: 30,
    phrases: [{ german: "Darf ich an diesem Punkt kurz einhaken?", english: "May I briefly come in at this point?" }, { german: "Wenn ich Sie richtig verstehe, …", english: "If I understand you correctly, …" }, { german: "Zusammenfassend lässt sich feststellen, dass …", english: "In summary, it can be concluded that …" }],
    exercise: { prompt: "Which phrase checks your understanding before responding?", choices: ["Wenn ich Sie richtig verstehe …", "Das kommt nicht infrage.", "Nebenbei bemerkt …"], answer: 0, explanation: "It paraphrases the other speaker’s position and invites correction." },
  },
];

export const germanResources: GermanResource[] = [
  { level: "ALL", title: "Deutsch für dich", provider: "Goethe-Institut", description: "Free vocabulary, grammar, reading and listening practice from beginner to advanced.", url: "https://www.goethe.de/prj/dfd/en/home.cfm", kind: "Practice" },
  { level: "ALL", title: "Free German exercises", provider: "Goethe-Institut", description: "Exercises, apps, films, podcasts and games for independent practice.", url: "https://www.goethe.de/ueben", kind: "Mixed media" },
  { level: "ALL", title: "Free online German course", provider: "DeutschAkademie", description: "A CEFR-aligned exercise library covering A1 through C1.", url: "https://www.deutschakademie.de/en/online-deutschkurs/", kind: "Exercises" },
  { level: "ALL", title: "Official exam training", provider: "Goethe-Institut", description: "Free practice materials for Goethe examinations from A1 through C1 and beyond.", url: "https://www.goethe.de/en/spr/prf/ueb.html", kind: "Exam practice" },
];

export const fallbackGermanCatalog: GermanCourseCatalog = {
  levels: germanLevels,
  lessons: germanLessons,
  resources: germanResources,
};
