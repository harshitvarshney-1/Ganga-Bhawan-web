import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as JotaiProvider } from 'jotai';
import { ThemeProvider } from './shared/plugins/theme/index.jsx';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <JotaiProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </JotaiProvider>
  </StrictMode>,
);
