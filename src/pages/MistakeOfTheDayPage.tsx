import { DailyMistakePuzzle } from '../components/DailyMistakePuzzle';
import { ToolNav } from '../components/ToolNav';

export function MistakeOfTheDayPage() {
  return (
    <main className="daily-page">
      <ToolNav />
      <header className="daily-title">
        <div>
          <p className="eyebrow">A fresh five-minute challenge</p>
          <h1>Mistake of the Day</h1>
          <p>One careless move changed everything. Can you spot why?</p>
        </div>
        <span>Daily case · 01</span>
      </header>
      <DailyMistakePuzzle />
    </main>
  );
}
