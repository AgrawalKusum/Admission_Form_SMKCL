// StartForm.jsx
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleSelect = (type) => {
    navigate("/admission-form", { state: { userType: type } });
  };

  return (
    <div className="form">
      <h1>Welcome to College Admission Portal</h1>
      <button
        onClick={() => handleSelect("new")}
        className="button"
      >
        New Admission
      </button>
      <button
        onClick={() => handleSelect("existing")}
        className="button"
      >
        Existing Student
      </button>
    </div>
  );
};

export default LandingPage;
