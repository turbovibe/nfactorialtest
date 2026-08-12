import { Link } from 'wouter';

export function NotFoundPage() {
  return <main className="centered-page"><div><p className="eyebrow">404</p><h1>This page doesn’t exist.</h1><Link className="primary-button" href="/">Return home</Link></div></main>;
}
