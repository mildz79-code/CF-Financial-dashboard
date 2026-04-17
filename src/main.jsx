import React from 'react';
import { createRoot } from 'react-dom/client';
import FinancialDashboard from './FinancialDashboard.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FinancialDashboard />
  </React.StrictMode>
);
