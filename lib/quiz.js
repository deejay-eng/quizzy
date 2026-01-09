// OpenTDB returns HTML entities in question/answers sometimes, so decode them.
export function decodeHtml(str) {
  if (!str) return "";
  if (typeof window === "undefined") return str;
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function fetchQuestions15() {
  // Assignment requires: https://opentdb.com/api.php?amount=15
  const url = "https://opentdb.com/api.php?amount=15";
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch questions");
  const data = await res.json();

  const results = data.results || [];
  return results.map((q, idx) => {
    const correct = q.correct_answer;
    const incorrect = q.incorrect_answers || [];
    const choices = shuffle([correct, ...incorrect]);

    return {
      id: String(idx + 1),
      question: q.question,
      correctAnswer: correct,
      choices,
    };
  });
}

export function formatTime(seconds) {
  const s = Math.max(0, seconds);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
