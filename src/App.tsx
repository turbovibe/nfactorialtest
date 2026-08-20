import { useRef } from 'react';
import { Redirect, Route, Switch } from 'wouter';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { AuthPage } from './pages/AuthPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TimeMachinePage } from './pages/TimeMachinePage';
import { DetectivePage } from './pages/DetectivePage';
import { MistakeOfTheDayPage } from './pages/MistakeOfTheDayPage';
import { usePointerGlow } from './lib/usePointerGlow';

export default function App() {
  const appRef = useRef<HTMLDivElement>(null);
  usePointerGlow(appRef);

  return (
    <div className="app-shell" ref={appRef}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/login" component={AuthPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/home"><Redirect to="/game" replace /></Route>
        <Route path="/game"><ProtectedRoute><GamePage /></ProtectedRoute></Route>
        <Route path="/time-machine"><ProtectedRoute><TimeMachinePage /></ProtectedRoute></Route>
        <Route path="/detective"><ProtectedRoute><DetectivePage /></ProtectedRoute></Route>
        <Route path="/mistake-of-the-day"><ProtectedRoute><MistakeOfTheDayPage /></ProtectedRoute></Route>
        <Route component={NotFoundPage} />
      </Switch>
    </div>
  );
}
