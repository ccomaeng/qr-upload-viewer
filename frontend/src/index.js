import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Check for development environment
const isDevelopment = process.env.NODE_ENV === 'development';

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render app with error boundary in development
if (isDevelopment) {
  // Enable React strict mode in development
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // Production render without strict mode for better performance
  root.render(<App />);
}

// Web vitals reporting (optional)
if (isDevelopment) {
  import('./reportWebVitals').then(({ default: reportWebVitals }) => {
    reportWebVitals(console.log);
  });
}