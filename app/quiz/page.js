"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { decodeHtml, fetchQuestions15, formatTime } from "../../lib/quiz";
import { loadState, saveState } from "../../lib/storage";

export default function QuizPage() {
  const router = useRouter();
  const tickRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [state, setState] = useState(null);
  const [current, setCurrent] = useState(0);
  const [remaining, setRemaining] = useState(30 * 60);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [fatal, setFatal] = useState("");

  const questions = state?.questions || [];
  const answers = state?.answers || {};
  const visited = state?.visited || {};

  const attemptedCount = useMemo(() => {
    return Object.values(answers).filter((v) => v != null && v !== "").length;
  }, [answers]);

  useEffect(() => {
    const s = loadState();
    if (!s) {
      router.replace("/");
      return;
    }
    if (s.status === "submitted") {
      router.replace("/report");
      return;
    }
    setState(s);
    setReady(true);
  }, [router]);

  // Fetch questions once, store in localStorage
  useEffect(() => {
    if (!ready || !state) return;
    if ((state.questions || []).length > 0) return;

    let cancelled = false;
    (async () => {
      try {
        setLoadingQuestions(true);
        const qs = await fetchQuestions15();
        if (cancelled) return;

        const next = { ...state, questions: qs };
        saveState(next);
        setState(next);
      } catch (e) {
        setFatal("Could not load questions. Please refresh and try again.");
      } finally {
        setLoadingQuestions(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, state]);

  // Timer (auto-submit at 0)
  useEffect(() => {
    if (!ready || !state) return;

    const startedAt = state.startedAt;
    const duration = state.durationSeconds ?? 30 * 60;

    const update = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const rem = duration - elapsed;
      setRemaining(rem);

      if (rem <= 0) {
        submit(true);
      }
    };

    update();
    tickRef.current = window.setInterval(update, 250);

    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, state]);

  // Mark current as visited
  useEffect(() => {
    if (!state) return;
    if (questions.length === 0) return;

    const nextVisited = { ...(state.visited || {}), [current]: true };
    const next = { ...state, visited: nextVisited };
    saveState(next);
    setState(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, questions.length]);

  function setAnswer(choice) {
    const nextAnswers = { ...(state.answers || {}), [current]: choice };
    const next = { ...state, answers: nextAnswers };
    saveState(next);
    setState(next);
  }

  function goTo(i) {
    if (i < 0 || i >= questions.length) return;
    setCurrent(i);
  }

  function submit(auto = false) {
    const s = loadState();
    if (!s || s.status === "submitted") return;

    const next = { ...s, status: "submitted", submittedAt: Date.now(), autoSubmitted: auto };
    saveState(next);
    router.replace("/report");
  }

  if (!ready) return null;

  if (fatal) {
    return (
      <div className="container">
        <div className="card">
          <h1 className="h1">Error</h1>
          <p className="p" style={{ color: "var(--danger)" }}>{fatal}</p>
          <button className="btn" onClick={() => router.replace("/")}>Go Home</button>
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="container">
      <div className="topbar">
        <div className="badge">
          <span>Time left:</span>
          <span className="timer">{formatTime(remaining)}</span>
        </div>
        <div className="badge">
          <span>Attempted:</span>
          <span className="timer">{attemptedCount}/{questions.length || 15}</span>
        </div>
        <button
  className="btn danger"
  onClick={() => {
    const ok = window.confirm("Submit now? You cannot change answers after submitting.");
    if (ok) submit(false);
  }}
>
  Submit Quiz
</button>

      </div>

      <div className="row">
        <div className="card">
          <h2 className="qTitle">
            {questions.length ? `Question ${current + 1} of ${questions.length}` : "Loading..."}
          </h2>

          {loadingQuestions || !q ? (
            <p className="p">Loading questions…</p>
          ) : (
            <>
              <div
                className="p"
                style={{ color: "var(--text)", marginBottom: 10 }}
                dangerouslySetInnerHTML={{ __html: decodeHtml(q.question) }}
              />

              <div className="answers">
                {q.choices.map((c) => {
                  const selected = answers[current] === c;
                  return (
                    <div
                      key={c}
                      className={`option ${selected ? "selected" : ""}`}
                      onClick={() => setAnswer(c)}
                      role="button"
                      tabIndex={0}
                    >
                      <input
                        type="radio"
                        checked={selected}
                        readOnly
                        style={{ marginTop: 3 }}
                      />
                      <div dangerouslySetInnerHTML={{ __html: decodeHtml(c) }} />
                    </div>
                  );
                })}
              </div>

              <hr className="hr" />

              <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
                <button className="btn" onClick={() => goTo(current - 1)} disabled={current === 0}>
                  Previous
                </button>
                <button className="btn" onClick={() => goTo(current + 1)} disabled={current === questions.length - 1}>
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        <div className="card">
          <h2 className="qTitle">Overview</h2>
          <p className="small">
            Boxes show: current, visited, attempted.
          </p>

          <div className="panel">
            {Array.from({ length: questions.length || 15 }).map((_, i) => {
              const isCurrent = i === current;
              const isVisited = !!visited[i];
              const isAttempted = answers[i] != null && answers[i] !== "";

              const cls = [
                "qbtn",
                isCurrent ? "current" : "",
                isAttempted ? "attempted" : "",
                !isAttempted && isVisited ? "visited" : "",
              ].join(" ");

              return (
                <button key={i} className={cls} onClick={() => goTo(i)}>
                  {i + 1}
                </button>
              );
            })}
          </div>

          <hr className="hr" />

          <div className="small" style={{ lineHeight: 1.6 }}>
            <div><span className="good">Green border</span>: attempted</div>
            <div><span style={{ color: "var(--muted)" }}>Outline</span>: visited</div>
            <div><span style={{ color: "var(--accent)" }}>Blue border</span>: current</div>
          </div>
        </div>
      </div>
    </div>
  );
}
