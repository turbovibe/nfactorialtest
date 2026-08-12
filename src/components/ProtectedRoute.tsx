import { Redirect } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { isDemoMode } from '../lib/demo';

type PageComponent = () => JSX.Element;

export function ProtectedRoute({ component: Page }: { component: PageComponent }) {
  const { loading, session } = useAuth();

  if (isDemoMode) return <Page />;

  if (loading) return <main className="centered-page">Loading…</main>;
  if (!session) return <Redirect to="/login" />;

  return <Page />;
}
