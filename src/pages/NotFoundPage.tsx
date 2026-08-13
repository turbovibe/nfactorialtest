import { Link } from 'wouter';

export function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section>
        <p className="eyebrow">Error 404</p>
        <h1>This position<br />doesn’t exist.</h1>
        <p>The page may have moved, but your next game is still waiting.</p>
        <Link href="/">Back to Mirror Move <span>→</span></Link>
      </section>
    </main>
  );
}
