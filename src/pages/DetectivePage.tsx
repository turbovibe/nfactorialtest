import { useState } from 'react';
import { ToolNav } from '../components/ToolNav';

const answers = ['Move the same piece again', 'Look for checks and captures', 'Push any edge pawn'];

export function DetectivePage() {
  const [answer, setAnswer] = useState<string>();
  const isCorrect = answer === answers[1];

  return (
    <main className="tools-page">
      <ToolNav />
      <section className="tool-workspace">
        <p className="eyebrow">Tool 03</p><h1>Mistake Detective</h1>
        <p className="workspace-lead">Train the thinking habit that helps you find hidden opportunities.</p>
        <article className="detective-card">
          <span>Case 001</span><h2>Your opponent left a piece unprotected. What should you examine first?</h2>
          <div className="answer-list">
            {answers.map((option) => <button onClick={() => setAnswer(option)} key={option}>{option}</button>)}
          </div>
          {answer && <p className={isCorrect ? 'answer-feedback answer-feedback--correct' : 'answer-feedback'}>{isCorrect ? 'Correct — forcing moves reveal tactical chances first.' : 'Not quite. Start with the moves your opponent must answer.'}</p>}
        </article>
      </section>
    </main>
  );
}
