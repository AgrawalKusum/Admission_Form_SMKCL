import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdmissionForm from './AdmissionForm';
import SuccessPage from './SuccessPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdmissionForm />} />
        <Route path="/success" element={<SuccessPage />} />
      </Routes>
    </Router>
  );
}

export default App;
