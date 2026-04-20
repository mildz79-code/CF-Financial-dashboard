import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import FinancialDashboard from './FinancialDashboard.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/2025" replace />} />
        <Route path="/2024" element={<FinancialDashboard year={2024} />} />
        <Route path="/2025" element={<FinancialDashboard year={2025} />} />
        <Route path="*" element={<Navigate to="/2025" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
