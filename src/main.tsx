import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@formio/js/dist/formio.full.css';
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
