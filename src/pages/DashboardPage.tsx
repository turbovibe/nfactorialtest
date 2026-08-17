import { Link } from 'wouter';
import { ToolNav } from '../components/ToolNav';

const tools = [
  { href: '/game', number: '01', title: 'Play Echo', text: 'Play a full game against a rival that learns your habits.' },
  { href: '/time-machine', number: '02', title: 'Time Machine', text: 'Learn how to revisit earlier moves and study what changed.' },
  { href: '/detective', number: '03', title: 'Mistake Detective', text: 'Practice spotting stronger moves with clues instead of answers.' },
  { href: '/mistake-of-the-day', number: '04', title: 'Mistake of the Day', text: 'Solve one quick position and uncover the move that changed everything.' },
];

export function DashboardPage() {
  return (
    <main className="tools-page dashboard-page">
      <ToolNav />
      <section className="dashboard-hero">
        <p className="eyebrow">Your training room</p>
        <h1>What do you want<br />to work on?</h1>
        <p>Choose a tool below or use the tabs at the top.</p>
      </section>
      <section className="tool-grid">
        {tools.map((tool) => (
          <Link className="tool-card glow-button" data-glow href={tool.href} key={tool.href}>
            <span>{tool.number}</span><h2>{tool.title}</h2><p>{tool.text}</p><b>Open tool →</b>
          </Link>
        ))}
      </section>
    </main>
  );
}
