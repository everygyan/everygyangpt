"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, Download, Flame, Headphones, Heart, Play, RotateCcw, Sparkles, Star, Trophy, Volume2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GermanCourseCatalog, GermanLesson, GermanLevelCode } from "@/data/german-course";
import type { GermanProgress } from "@/lib/german-course";

type Props = {
  catalog: GermanCourseCatalog;
  catalogSource: "supabase" | "starter";
  initialProgress: GermanProgress;
  learnerName: string | null;
};

const STORAGE_KEY = "everygyan:german-progress:v1";
const PRACTICE_KEY = "everygyan:german-last-practice";

function lessonNumber(lessons: GermanLesson[], lesson: GermanLesson) {
  return lessons.filter((candidate) => candidate.level === lesson.level).findIndex((candidate) => candidate.slug === lesson.slug) + 1;
}

export function GermanLearningHub({ catalog, catalogSource, initialProgress, learnerName }: Props) {
  const [selectedLevel, setSelectedLevel] = useState<GermanLevelCode>("A1");
  const [completed, setCompleted] = useState<Set<string>>(() => new Set(initialProgress.completedLessons));
  const [activeLesson, setActiveLesson] = useState<GermanLesson | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [streak, setStreak] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [unitFilter, setUnitFilter] = useState("all");
  const dialogRef = useRef<HTMLElement>(null);
  const exercises = activeLesson?.exercises?.length ? activeLesson.exercises : activeLesson ? [activeLesson.exercise] : [];
  const activeExercise = exercises[questionIndex];
  const lastQuestion = questionIndex === exercises.length - 1;

  useEffect(() => {
    if (!activeLesson) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) setActiveLesson(null);
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], summary, [tabindex="0"]') ?? []);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      window.speechSynthesis?.cancel();
      previouslyFocused?.focus();
    };
  }, [activeLesson, saving]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]") as string[];
        setCompleted((current) => new Set([...current, ...saved]));
        const lastPractice = window.localStorage.getItem(PRACTICE_KEY);
        if (lastPractice) {
          const days = Math.floor((Date.now() - new Date(lastPractice).getTime()) / 86_400_000);
          setStreak(days <= 1 ? 1 : 0);
        }
      } catch {
        // A restricted browser may disable storage; the course still remains usable.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const levelLessons = useMemo(
    () => catalog.lessons.filter((lesson) => lesson.level === selectedLevel),
    [catalog.lessons, selectedLevel],
  );
  const completedXp = catalog.lessons.reduce((sum, lesson) => completed.has(lesson.slug) ? sum + lesson.xp : sum, 0);
  const activeLevel = catalog.levels.find((level) => level.code === selectedLevel) ?? catalog.levels[0];
  const completedInLevel = levelLessons.filter((lesson) => completed.has(lesson.slug)).length;
  const progressPercent = levelLessons.length ? Math.round((completedInLevel / levelLessons.length) * 100) : 0;
  const groupedUnits = Array.from(new Set(levelLessons.map((lesson) => lesson.unit))).map((unit) => ({
    title: unit,
    lessons: levelLessons.filter((lesson) => lesson.unit === unit),
  }));
  const nextLesson = levelLessons.find((lesson) => !completed.has(lesson.slug)) ?? levelLessons[0];

  function openLesson(lesson: GermanLesson) {
    setActiveLesson(lesson);
    setSelectedAnswer(null);
    setChecked(false);
    setSyncMessage("");
    setQuestionIndex(0);
  }

  function closeLesson() {
    setActiveLesson(null);
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
  }

  async function finishLesson() {
    if (!activeLesson || !lastQuestion || !checked || selectedAnswer !== activeExercise.answer || saving) return;
    const nextCompleted = new Set(completed).add(activeLesson.slug);
    setCompleted(nextCompleted);
    setStreak(1);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...nextCompleted]));
      window.localStorage.setItem(PRACTICE_KEY, new Date().toISOString());
    } catch {
      // Keep the in-memory progress if browser storage is unavailable.
    }

    if (!learnerName) {
      setSyncMessage("Progress saved on this device. Sign in to sync it across devices.");
      return;
    }
    if (catalogSource !== "supabase") {
      setSyncMessage("Progress saved on this device. Account sync is temporarily unavailable.");
      return;
    }
    try {
      setSaving(true);
      const response = await fetch("/api/learn-german/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonSlug: activeLesson.slug, score: 100 }),
      });
      setSyncMessage(response.ok ? "Progress synced to your EveryGyan account." : "Saved on this device. Use Save completion again to retry account sync.");
    } catch {
      setSyncMessage("Saved on this device. Use Save completion again to retry account sync.");
    } finally {
      setSaving(false);
    }
  }

  function resetLesson() {
    setSelectedAnswer(null);
    setChecked(false);
    setSyncMessage("");
  }

  return (
    <div className="german-hub">
      <section className="german-hero">
        <div className="shell german-hero-grid">
          <div className="german-hero-copy">
            <Link className="german-back-link" href="/topic/learn"><ArrowLeft size={17} /> Back to Learn</Link>
            <span className="german-kicker"><Sparkles size={15} /> Learn German with EveryGyan</span>
            <h1>Small lessons.<br /><span>Große Fortschritte.</span></h1>
            <p>Build practical German from A1 to C1 with quick, friendly lessons, pronunciation practice and trusted free resources.</p>
            <div className="german-hero-actions">
              {nextLesson && <button className="german-primary-button" type="button" onClick={() => openLesson(nextLesson)}><Play size={18} fill="currentColor" /> {completedInLevel ? "Continue learning" : "Start learning"}</button>}
              <a className="german-secondary-button" href="#course-path">Explore the course <ArrowRight size={17} /></a>
            </div>
            <div className="german-trust-row">
              <span><Check size={16} /> 50 structured A1 lessons</span>
              <span><Volume2 size={16} /> German pronunciation</span>
              <span><Trophy size={16} /> A1 to C1 path</span>
            </div>
          </div>
          <div className="german-hero-card" aria-label="Your German learning progress">
            <div className="german-mascot" aria-hidden="true">G</div>
            <div className="german-card-bubble">
              <strong>{learnerName ? `Hallo, ${learnerName.split(" ")[0]}!` : "Hallo! Bereit?"}</strong>
              <span>Make time for one lesson today. Learn, practise and use it.</span>
            </div>
            <div className="german-stat-grid">
              <div><Flame size={24} /><strong>{streak}</strong><span>day streak</span></div>
              <div><Star size={24} /><strong>{completedXp}</strong><span>total XP</span></div>
              <div><Heart size={24} /><strong>{completed.size}</strong><span>lessons</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell german-course-section" id="course-path">
        <div className="german-section-heading">
          <div><span className="german-eyebrow">CEFR learning path</span><h2>Choose your level</h2><p>Start where you feel comfortable. You can explore every level at any time.</p></div>
          <span className="german-source-status"><span /> Learn at your own pace</span>
        </div>

        <div className="german-level-tabs" role="tablist" aria-label="German course levels">
          {catalog.levels.map((level) => {
            const lessonCount = catalog.lessons.filter((lesson) => lesson.level === level.code).length;
            const done = catalog.lessons.filter((lesson) => lesson.level === level.code && completed.has(lesson.slug)).length;
            return (
              <button
                key={level.code}
                className={selectedLevel === level.code ? "active" : ""}
                style={{ "--level-color": level.color } as React.CSSProperties}
                type="button"
                role="tab"
                aria-selected={selectedLevel === level.code}
                onClick={() => { setSelectedLevel(level.code); setUnitFilter("all"); }}
              >
                <strong>{level.code}</strong><span>{level.title}</span><small>{done}/{lessonCount}</small>
              </button>
            );
          })}
        </div>

        <div className="german-learning-layout">
          <aside className="german-level-card" style={{ "--level-color": activeLevel.color } as React.CSSProperties}>
            <span className="german-level-badge">{activeLevel.code}</span>
            <p className="german-eyebrow">{activeLevel.title}</p>
            <h3>{activeLevel.description}</h3>
            <p>{activeLevel.outcome}</p>
            <div className="german-progress-label"><span>Level progress</span><strong>{progressPercent}%</strong></div>
            <div className="german-progress"><span style={{ width: `${progressPercent}%` }} /></div>
            <small>{completedInLevel} of {levelLessons.length} lessons complete</small>
            <label className="german-unit-filter">Jump to a unit
              <select value={unitFilter} onChange={(event) => setUnitFilter(event.target.value)}>
                <option value="all">All units</option>
                {groupedUnits.map((unit, i) => <option key={unit.title} value={unit.title}>Unit {i + 1}: {unit.title}</option>)}
              </select>
            </label>
          </aside>

          <div className="german-path">
            {groupedUnits.map((unit, unitIndex) => (unitFilter === "all" || unitFilter === unit.title) && (
              <div className="german-unit" key={unit.title}>
                <header><span>Unit {unitIndex + 1}</span><h3>{unit.title}</h3></header>
                <div className="german-lesson-path">
                  {unit.lessons.map((lesson, index) => {
                    const isDone = completed.has(lesson.slug);
                    return (
                      <div className={`german-lesson-row ${index % 2 ? "offset" : ""}`} key={lesson.slug}>
                        <button className={`german-lesson-node ${isDone ? "complete" : ""}`} type="button" onClick={() => openLesson(lesson)} aria-label={`Open ${lesson.title}`}>
                          {isDone ? <Check size={27} strokeWidth={3} /> : <span>{lesson.icon}</span>}
                        </button>
                        {lesson.pdfUrl?.startsWith("/resources/german-a1/") && <a className="german-pdf-link" href={lesson.pdfUrl} download aria-label={`Download worksheet for ${lesson.title}`}><Download size={18} /><span>PDF</span></a>}
                        <button className="german-lesson-copy" type="button" onClick={() => openLesson(lesson)}>
                          <small>Lesson {lessonNumber(levelLessons, lesson)} · {lesson.minutes} min · +{lesson.xp} XP</small>
                          <strong>{lesson.title}</strong>
                          <span>{lesson.description}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="german-resource-band">
        <div className="shell">
          <div className="german-section-heading">
            <div><span className="german-eyebrow">Continue with trusted sources</span><h2>A free German learning library</h2><p>EveryGyan lessons give you a clear path. These independent resources provide deeper practice and official exam preparation.</p></div>
          </div>
          <div className="german-resource-grid">
            {catalog.resources.filter((resource) => resource.level === "ALL" || resource.level === selectedLevel).map((resource) => (
              <a key={`${resource.provider}-${resource.title}`} href={resource.url} target="_blank" rel="noreferrer" className="german-resource-card">
                <span className="german-resource-icon"><BookOpen size={22} /></span>
                <small>{resource.kind} · {resource.level === "ALL" ? "A1–C1" : resource.level}</small>
                <h3>{resource.title}</h3>
                <strong>{resource.provider}</strong>
                <p>{resource.description}</p>
                <span className="german-resource-link">Open free resource <ArrowRight size={16} /></span>
              </a>
            ))}
          </div>
          <p className="german-resource-note">External courses remain on their providers’ websites. EveryGyan links to them and does not copy or republish their materials.</p>
        </div>
      </section>

      {activeLesson && (
        <div className="german-lesson-overlay" role="presentation">
          <section ref={dialogRef} className="german-lesson-player" role="dialog" aria-modal="true" aria-labelledby="german-lesson-title">
            <header className="german-player-header">
              <button type="button" disabled={saving} onClick={closeLesson} aria-label="Close lesson"><X size={23} /></button>
              <div className="german-player-progress" aria-label={`Question ${questionIndex + 1} of ${exercises.length}`}><span style={{ width: `${100 * (questionIndex + (checked && selectedAnswer === activeExercise.answer ? 1 : 0)) / exercises.length}%` }} /></div>
              <span><Heart size={20} fill="currentColor" /> {activeLesson.xp} XP</span>
            </header>
            <div className="german-player-body">
              <span className="german-eyebrow">{activeLesson.level} · {activeLesson.unit}</span>
              <h2 id="german-lesson-title">{activeLesson.title}</h2>
              <p>{activeLesson.description}</p>
              {activeLesson.pdfUrl?.startsWith("/resources/german-a1/") && <a className="german-secondary-button german-worksheet-button" href={activeLesson.pdfUrl} download><Download size={18} /> Download lesson worksheet (PDF)</a>}
              {!!activeLesson.notes?.length && <section className="german-teaching"><h3>Learn the idea</h3>{activeLesson.notes.map((note) => <p key={note}>{note}</p>)}</section>}
              <h3>Words and phrases · listen and repeat</h3>

              <div className="german-phrase-list">
                {activeLesson.phrases.map((phrase) => (
                  <div key={phrase.german}>
                    <button type="button" onClick={() => speak(phrase.german)} aria-label={`Listen to ${phrase.german}`}><Volume2 size={20} /></button>
                    <span><strong>{phrase.german}</strong><small>{phrase.english}</small></span>
                  </div>
                ))}
              </div>

              {!!activeLesson.dialogue?.length && <section className="german-teaching"><h3>Try the conversation</h3><p>Read both roles. Listen, repeat, then hide the translation and try again.</p>{activeLesson.dialogue.map((line, i) => <div className="german-dialogue-line" key={i}><button type="button" onClick={() => speak(line.german)} aria-label={`Listen to dialogue line ${i + 1}`}><Volume2 size={18} /></button><div><small>{line.speaker}</small><p lang="de">{line.german}</p><details><summary>Show translation</summary><p>{line.english}</p></details></div></div>)}</section>}
              {activeLesson.task && <section className="german-mission"><h3>Your real-life mission</h3><p>{activeLesson.task}</p><details><summary>See a sample answer</summary><p>{activeLesson.model}</p></details></section>}

              <div className="german-question">
                <span><Headphones size={19} /> Practice · question {questionIndex + 1} of {exercises.length}</span>
                <h3>{activeExercise.prompt}</h3>
                <div className="german-answer-grid">
                  {activeExercise.choices.map((choice, index) => {
                    const correct = checked && index === activeExercise.answer;
                    const wrong = checked && selectedAnswer === index && index !== activeExercise.answer;
                    return <button className={`${selectedAnswer === index ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`} key={choice} type="button" disabled={checked} onClick={() => setSelectedAnswer(index)}><span>{index + 1}</span>{choice}{correct && <Check size={18} />}{wrong && <X size={18} />}</button>;
                  })}
                </div>
              </div>
            </div>
            <footer className={`german-player-footer ${checked ? selectedAnswer === activeExercise.answer ? "success" : "error" : ""}`}>
              <div aria-live="polite">
                {checked && <><strong>{selectedAnswer === activeExercise.answer ? "Sehr gut!" : "Almost there."}</strong><span>{activeExercise.explanation}</span>{syncMessage && <small>{syncMessage}</small>}</>}
              </div>
              {!checked && <button className="german-primary-button" type="button" disabled={selectedAnswer === null} onClick={() => setChecked(true)}>Check answer</button>}
              {checked && selectedAnswer !== activeExercise.answer && <button className="german-secondary-button" type="button" onClick={resetLesson}><RotateCcw size={17} /> Try again</button>}
              {checked && selectedAnswer === activeExercise.answer && !lastQuestion && <button className="german-primary-button" type="button" onClick={() => { setQuestionIndex((i) => i + 1); resetLesson(); }}>Next question <ChevronRight size={18} /></button>}
              {checked && selectedAnswer === activeExercise.answer && lastQuestion && <button className="german-primary-button" type="button" disabled={saving} onClick={finishLesson}>{saving ? "Saving…" : completed.has(activeLesson.slug) ? "Save completion again" : "Complete lesson"}<ChevronRight size={18} /></button>}
              {checked && selectedAnswer === activeExercise.answer && lastQuestion && completed.has(activeLesson.slug) && <button className="german-secondary-button" type="button" disabled={saving} onClick={closeLesson}>Back to course</button>}
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
