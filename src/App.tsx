import { Route, Switch } from 'wouter';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './components/AuthProvider';
import { AuthPage } from './pages/AuthPage';
import { ActionsPage } from './pages/ActionsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ConversationsPage } from './pages/ConversationsPage';
import { HomePage } from './pages/HomePage';
import { OnboardingPage } from './pages/OnboardingPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/login" component={AuthPage} />
        <Route path="/onboarding">
          <ProtectedRoute component={OnboardingPage} />
        </Route>
        <Route path="/dashboard">
          <ProtectedRoute component={DashboardPage} />
        </Route>
        <Route path="/conversations">
          <ProtectedRoute component={ConversationsPage} />
        </Route>
        <Route path="/actions">
          <ProtectedRoute component={ActionsPage} />
        </Route>
        <Route component={NotFoundPage} />
      </Switch>
    </AuthProvider>
  );
}
