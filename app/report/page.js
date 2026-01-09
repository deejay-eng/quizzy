"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { decodeHtml } from "../../lib/quiz";
import { clearState, loadState } from "../../lib/storage";

export default function ReportPage() {
  const router = useRouter();
  const state = useMemo(() => loadState(), []);

  useEffect(() => {
    if (!state) router.replace("/");
    // If quiz not submitted yet, push back to quiz.
    if (state && state.status !== "submitted") router.replace("/quiz");
  }, [router, state]);

  if (!state || state.status !== "submitted") return null;

  const questions = state.questions || [];
  const answers = state.answers || {};

  const score = questions.reduce((acc, q, idx) => {
    return acc + ((answers[idx] || "") === q.correctAnswer ? 1 : 0);
  }, 0);

  function restart() {
    clearState();
    router.replace("/");
  }

  return (
    <div className="container">
      <div className="card">
        <div className="topbar">
          <div>
            <h1 className="h1" style={{ marginBottom: 6 }}>Report</h1>
            <div className="small">Email: {state.email}</div>
          </div>
          <button className="btn" onClick={restart}>Start New Quiz</button>
        </div>

        <div className="badge" style={{ marginBottom: 12 }}>
          <span>Score:</span>
          <span className="timer">{score}/{questions.length}</span>
          {state.autoSubmitted ? <span className="small" style={{ marginLeft: 10 }}>(Auto-submitted)</span> : null}
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {questions.map((q, idx) => {
            const userAns = answers[idx] ?? "";
            const correct = q.correctAnswer;
            const ok = userAns === correct;

            return (
              <div key={q.id} className="reportItem">
                <div className="small" style={{ marginBottom: 6 }}>
                  Question {idx + 1}
                </div>

                <div
                  className="p"
                  style={{ color: "var(--text)", marginBottom: 10 }}
                  dangerouslySetInnerHTML={{ __html: decodeHtml(q.question) }}
                />

                <div className="kv">
                  <div>
                    <div className="small">Your answer</div>
                    <div className={ok ? "good" : "bad"}>
                      {userAns ? (
                        <span dangerouslySetInnerHTML={{ __html: decodeHtml(userAns) }} />
                      ) : (
                        <span className="bad">Not answered</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="small">Correct answer</div>
                    <div className="good">
                      <span dangerouslySetInnerHTML={{ __html: decodeHtml(correct) }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
