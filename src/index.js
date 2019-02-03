import './global-styles.css';
import React, {Suspense} from 'react';
import ReactDOM from 'react-dom';
import {Router} from '@reach/router';
import ErrorBoundary from 'react-error-boundary';
import ThemeProvider from './shared/theme-provider';
import {IsolatedContainer, LoadingMessagePage} from './shared/pattern';
import * as GitHubContext from './github-client';

// IMPORTANT: loadable() is meant for code splitting.  React.lazy does the same thing now.
// we only load Home and User when each of these respective pages are hit, rather than on app load
const Home = React.lazy(() => import('./screens/home'));
const User = React.lazy(() => import('./screens/user'));

// React.lazy() vs loadable()
// const User = loadable({
//   loader: () => import('./screens/user'),
//   loading: LoadingFallback,
// });

function ErrorFallback({error}) {
  return (
    <IsolatedContainer>
      <p>There was an error</p>
      <pre style={{maxWidth: 700}}>{JSON.stringify(error, null, 2)}</pre>
    </IsolatedContainer>
  );
}

function App() {
  // <Suspense /> (from React import) needs to be used somewhere
  // around where we're lazy loading (in this case, we're lazy loading Home and User)
  return (
    <ThemeProvider>
      <GitHubContext.Provider>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense
            fallback={
              <LoadingMessagePage>Loading Application</LoadingMessagePage>
            }
          >
            <Router>
              <Home path="/" />
              <User path="/:username" />
            </Router>
          </Suspense>
        </ErrorBoundary>
      </GitHubContext.Provider>
    </ThemeProvider>
  );
}

const ui = <App />;
const container = document.getElementById('root');

ReactDOM.render(ui, container);
