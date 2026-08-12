import { Link } from 'wouter';
import { Brand } from '../components/Brand';
import { useAuth } from '../hooks/useAuth';
import { isDemoMode } from '../lib/demo';

const benefits = [
  ['24/7', 'Answers customer questions'],
  ['Smart', 'Qualifies every new lead'],
  ['Clear', 'Tracks the revenue it creates'],
];

export function HomePage() {
  const { session } = useAuth();

  return (
    <main className="landing">
      <header className="landing-nav">
        <Brand />
        <Link className="nav-button" href={session || isDemoMode ? '/dashboard' : '/login'}>{session || isDemoMode ? 'Open demo' : 'Sign in'}</Link>
      </header>
      <section className="hero">
        <p className="eyebrow">Your first AI employee</p>
        <h1>Turn every conversation into <em>business.</em></h1>
        <p className="hero-copy">Operator talks to customers, answers questions, qualifies leads, and takes action—while showing exactly what it generated.</p>
        <div className="hero-actions">
          <Link className="primary-button" href={session || isDemoMode ? '/dashboard' : '/login'}>{isDemoMode ? 'Explore the demo' : 'Build your AI employee'}</Link>
          <span>No credit card required</span>
        </div>
      </section>
      <section className="benefit-grid">
        {benefits.map(([title, text]) => <article key={title}><strong>{title}</strong><p>{text}</p></article>)}
      </section>
    </main>
  );
}
