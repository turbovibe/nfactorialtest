import { Link } from 'wouter';

export function HomePage() {
  return (
    <main className="landing">
      <nav className="topbar">
        <Link className="brand" href="/">MIRROR MOVE</Link>
        <div className="topbar__actions">
          <span className="status-dot">Prototype 01</span>
          <Link className="auth-link" href="/login">Sign in</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow">A rival built from your habits</p>
          <h1>It does not just play you.<br /><em>It learns you.</em></h1>
          <p className="hero__lead">
            Meet Echo, a chess rival that notices how you attack, changes its plan,
            and turns your biggest mistake into a mystery you can solve.
          </p>
          <Link className="primary-link" href="/game">Challenge Echo <span>→</span></Link>
        </div>

        <div className="hero__visual" aria-hidden="true">
          <div className="orbit orbit--one" />
          <div className="orbit orbit--two" />
          <span className="hero-knight">♞</span>
          <div className="thought">I’ll remember that.</div>
        </div>
      </section>

      <section className="feature-strip">
        <article><span>01</span><h2>Adaptive rival</h2><p>Echo changes its priorities as your style becomes clear.</p></article>
        <article><span>02</span><h2>Time machine</h2><p>Jump back to any move without losing the real game.</p></article>
        <article><span>03</span><h2>Mistake detective</h2><p>Get a clue, not an answer, when the position turns.</p></article>
      </section>
    </main>
  );
}
