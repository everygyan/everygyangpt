import fs from "node:fs";
import assert from "node:assert/strict";
import { loadA1 } from "./lib/load-german-a1.mjs";

const lessons = loadA1();
assert.equal(lessons.length, 50);
assert.equal(new Set(lessons.map((lesson) => lesson.slug)).size, 50);
for (let unit = 1; unit <= 10; unit++) assert.equal(lessons.filter((lesson) => lesson.unitOrder === unit).length, 5);
for (const lesson of lessons) {
  assert.equal(lesson.phrases.length, 5);
  assert.equal(lesson.exercises.length, 5);
  assert.ok(lesson.notes.join(" ").split(/\s+/).length >= 70, lesson.slug);
  assert.ok(lesson.dialogue.length >= 3);
  for (const q of lesson.exercises) {
    assert.equal(q.choices.length, 3);
    assert.equal(new Set(q.choices).size, 3);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 3);
  }
}
fs.mkdirSync("tmp/pdfs", { recursive: true });
fs.writeFileSync("tmp/pdfs/german-a1.json", JSON.stringify(lessons, null, 2));
console.log("Validated and exported 50 lessons, 10 units, 250 exercises and 250 phrases.");
