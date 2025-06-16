import React from "react";
import { useLocation } from "react-router-dom";

const SuccessPage = () => {
  const location = useLocation();
  const { studentId, candidateName, Course, Session } = location.state || {};

  return (
    <div className="success-page">
        <form>
            <h2>Submission Successful!</h2>
            <p>Candidate Name: <strong>{candidateName}</strong></p>
            <p>Course: <strong>{Course}</strong></p>
            <p>Session: <strong>{Session}</strong></p>
            <p>Your Student ID is <strong>{studentId}</strong></p>
        </form>
    </div>
  );
};

export default SuccessPage;
