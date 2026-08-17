import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { MovePredictionHook } from '../components/MovePredictionHook';

const benefits = [
  { number: '01', title: 'Play a full game', text: 'Challenge Echo on a complete interactive board with legal moves and instant responses.', detail: 'Real chess, move by move' },
  { number: '02', title: 'Meet your adaptive rival', text: 'Echo notices how you develop, attack, and use your queen, then changes what it prioritises.', detail: 'A different rival for every player' },
  { number: '03', title: 'See your playing style', text: 'Watch Echo build a live profile of your habits and explain what it has learned about you.', detail: 'Live style reading' },
  { number: '04', title: 'Rewind any position', text: 'Use the Time Machine to revisit earlier moves and understand exactly where the game changed.', detail: 'Explore without losing the game' },
  { number: '05', title: 'Solve your mistakes', text: 'Mistake Detective gives you a useful clue instead of spoiling the strongest move.', detail: 'Learn the thinking, not the answer' },
];

export function HomePage() {
  const [, navigate] = useLocation();
  const isAuthReturn = new URLSearchParams(window.location.search).has('code')
    || window.location.hash.includes('access_token=');

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/home', { replace: true });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate('/home', { replace: true });
    });

    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  if (isAuthReturn) {
    return <main className="auth-loading auth-loading--callback" aria-live="polite"><span>Entering your training room…</span></main>;
  }

  return (
    <main className="landing">
      <nav className="topbar">
        <Link className="brand" href="/">MIRROR MOVE</Link>
        <div className="topbar__actions">
          <span className="status-dot">Prototype 01</span>
          <Link className="auth-link glow-button" data-glow href="/login">Sign in</Link>
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
          <Link className="primary-link glow-button" data-glow href="/game">Challenge Echo <span>→</span></Link>
        </div>

        <div className="hero__visual" aria-hidden="true">
          <div className="visual-floor" />
          <div className="scene">
            <div className="orbit orbit--one" />
            <div className="orbit orbit--two" />
            <div className="piece-plinth"><span className="hero-knight">♞</span></div>
            <div className="thought">I’ll remember that.</div>
          </div>
        </div>
      </section>

      <MovePredictionHook />

      <section className="benefits" aria-labelledby="benefits-title">
        <div className="benefits__intro">
          <p className="eyebrow">More than a chess bot</p>
          <h2 id="benefits-title">Every move becomes<br />a lesson about your game.</h2>
          <p>Mirror Move helps you play, investigate, and improve—all in one focused training room.</p>
        </div>
        <div className="benefit-grid">
          {benefits.map((benefit) => (
            <article className="benefit-card" key={benefit.number}>
              <span>{benefit.number}</span>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
              <small>{benefit.detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <div><p className="eyebrow">Ready when you are</p><h2>Make your next move count.</h2></div>
        <p>Sign in to enter your training room and challenge the rival that pays attention.</p>
        <Link className="cta-signin glow-button" data-glow href="/login">Sign in and play <span>→</span></Link>
      </section>
    </main>
  );
}
