import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { Toaster } from 'react-hot-toast';
import { ChatProvider } from './context/ChatContext.jsx';
import AppRoutes from './config/AppRoutes.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster />
      <ChatProvider>
        <AppRoutes />
      </ChatProvider>
    </BrowserRouter>
  </StrictMode>
);