import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdmissionForm from './AdmissionForm';
import PreviewPage from "./PreviewPage";
import SuccessPage from './SuccessPage';
import LandingPage from './LandingPage';
import { FormProvider } from './FormContext';
import './App.css';

function App() {
  return (
    <FormProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admission-form" element={<AdmissionForm />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/success" element={<SuccessPage />} />
        </Routes>
      </Router>
    </FormProvider>
  );
}

export default App;
