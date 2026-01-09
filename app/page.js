"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearState, loadState, saveState } from "../lib/storage";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function StartPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // If quiz is already running, go to it.
    const state = loadState();
    if (state?.status === "in_progress") router.replace("/quiz");
    if (state?.status === "submitted") router.replace("/report");
  }, [router]);

  function start() {
    setError("");
    const e = email.trim();
    if (!isValidEmail(e)) {
      setError("Please enter a valid email address.");
      return;
    }

    clearState();
    saveState({
      email: e,
      status: "in_progress",
      startedAt: Date.now(),
      durationSeconds: 30 * 60, // 30 minutes
      questions: [],
      answers: {}, // { [questionIndex]: choiceString }
      visited: {}, // { [questionIndex]: true }
      submittedAt: null,
    });

    router.push("/quiz");
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="h1">Quiz Application</h1>
        <p className="p">
          Enter your email to start. You will get 15 questions and 30 minutes.
        </p>

        <label className="small">Email address</label>
        <input
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        {error ? <p className="p" style={{ color: "var(--danger)" }}>{error}</p> : null}

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button className="btn primary" onClick={start}>Start Quiz</button>
        </div>

        <hr className="hr" />
        <p className="small">
          Data source: Open Trivia DB (api.php?amount=15).
        </p>
      </div>
    </div>
  );
}
