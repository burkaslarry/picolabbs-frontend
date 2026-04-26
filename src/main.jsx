import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LangProvider } from './LangContext';
import { UserProvider } from './UserContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LangProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </LangProvider>
    </BrowserRouter>
  </React.StrictMode>
);
