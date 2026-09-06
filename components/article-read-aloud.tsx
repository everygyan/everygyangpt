"use client";

import { Pause, Play, RotateCcw, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ReaderState = "idle" | "playing" | "paused" | "finished";

function chunks(text: string) {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
  const result: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (current && `${current} ${sentence}`.length > 220) {
      result.push(current.trim());
      current = sentence;
    } else current = `${current} ${sentence}`;
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

export function ArticleReadAloud({ title, text }: { title: string; text: string }) {
  const [state, setState] = useState<ReaderState>("idle");
  const generation = useRef(0);
  const content = `${title}. ${text}`.replace(/\s+/g, " ").trim();
  const supported = typeof window === "undefined" || ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window);

  useEffect(() => {
    return () => {
      generation.current += 1;
      window.speechSynthesis?.cancel();
    };
  }, []);

  function speakFromStart() {
    if (!supported || !content) return;
    const run = ++generation.current;
    const parts = chunks(content);
    window.speechSynthesis.cancel();
    setState("playing");
    const speakPart = (index: number) => {
      if (run !== generation.current) return;
      if (index >= parts.length) {
        setState("finished");
        return;
      }
      const utterance = new SpeechSynthesisUtterance(parts[index]);
      utterance.lang = "en-US";
      utterance.rate = 0.94;
      utterance.onend = () => speakPart(index + 1);
      utterance.onerror = () => setState("idle");
      window.speechSynthesis.speak(utterance);
    };
    speakPart(0);
  }

  function togglePause() {
    if (state === "paused") {
      window.speechSynthesis.resume();
      setState("playing");
    } else {
      window.speechSynthesis.pause();
      setState("paused");
    }
  }

  function stop() {
    generation.current += 1;
    window.speechSynthesis.cancel();
    setState("idle");
  }

  if (!supported) return null;
  return (
    <div className="article-audio" aria-label="Listen to this article">
      <div><span className="article-audio-icon" aria-hidden="true">Aa</span><span><strong>Listen to this article</strong><small>Read aloud in your browser</small></span></div>
      <div className="article-audio-actions">
        {(state === "idle" || state === "finished") && <button type="button" onClick={speakFromStart}>{state === "finished" ? <RotateCcw size={17} /> : <Play size={17} fill="currentColor" />}{state === "finished" ? "Read again" : "Read aloud"}</button>}
        {(state === "playing" || state === "paused") && <><button type="button" onClick={togglePause}>{state === "paused" ? <Play size={17} fill="currentColor" /> : <Pause size={17} />}{state === "paused" ? "Resume" : "Pause"}</button><button className="article-audio-stop" type="button" onClick={stop}><Square size={15} fill="currentColor" /> Stop</button></>}
      </div>
      <span className="visually-hidden" aria-live="polite">{state === "playing" ? "Article is being read aloud" : state === "paused" ? "Reading paused" : state === "finished" ? "Reading finished" : ""}</span>
    </div>
  );
}
