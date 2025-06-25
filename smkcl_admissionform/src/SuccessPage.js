import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const SuccessPage = () => {
  const location = useLocation();
  const [successData, setSuccessData] = useState({
    studentId: "",
    candidateName: "",
    Course: "",
    Session: ""
  });

  useEffect(() => {
    if (location.state) {
      setSuccessData(location.state);
      localStorage.setItem("successData", JSON.stringify(location.state));
    } else {
      const saved = localStorage.getItem("successData");
      if (saved) {
        setSuccessData(JSON.parse(saved));
      }
    }
  }, [location.state]);

  const { studentId, candidateName, Course, Session } = successData;

  return (
    <div>
      <form>
        <div id="printable">
          <h2>Submission Successful!</h2>
          <p>Candidate Name: <strong>{candidateName}</strong></p>
          <p>Course: <strong>{Course}</strong></p>
          <p>Session: <strong>{Session}</strong></p>
          <p>Your Student ID is <strong>{studentId}</strong></p>
        </div>

        <button
          type="button"
          className="no-print"
          onClick={() => window.print()}
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default SuccessPage;