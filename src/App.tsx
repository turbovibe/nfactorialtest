import { Route, Switch } from 'wouter';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { AuthPage } from './pages/AuthPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { TimeMachinePage } from './pages/TimeMachinePage';
import { DetectivePage } from './pages/DetectivePage';

export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/home"><ProtectedRoute><DashboardPage /></ProtectedRoute></Route>
      <Route path="/game">
        <ProtectedRoute><GamePage /></ProtectedRoute>
      </Route>
      <Route path="/time-machine"><ProtectedRoute><TimeMachinePage /></ProtectedRoute></Route>
      <Route path="/detective"><ProtectedRoute><DetectivePage /></ProtectedRoute></Route>
      <Route component={NotFoundPage} />
    </Switch>
  );
}
