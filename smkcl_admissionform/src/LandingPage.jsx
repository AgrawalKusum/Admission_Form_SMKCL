import { useNavigate } from "react-router-dom";
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleSelect = (type) => {
    navigate("/admission-form", { state: { userType: type } });
  };

  return (
    <div className="page-background">
  <div className="full-card">
    {/* Left Half */}
    <div className="card-left">
        <div className="card-instructions">
        <p>Please read the instructions carefully before starting the admission form.</p>
        <h3>Required Documents:</h3>
        <ul>
          <li>Passport-size Photograph (.jpg/.png, Max 500KB)</li>
          <li>Signature (.jpg/.png, Max 200KB)</li>
          <li>10th & 12th Mark Sheets (.pdf, Max 1MB each)</li>
          <li>Caste Certificate (if applicable) (.pdf, Max 1MB)</li>
          <li>Any additional qualifications (.pdf, Max 1MB each)</li>
        </ul>
        <p>Ensure all documents are clearly scanned and meet the file format & size limits.</p>
      </div>
    </div>

    {/* Right Half */}
    <div className="card-right">
      <h1>Smt. Mohan Kaur College Of Law</h1>
      <h4>Affiliated to CCS University, Meerut (NAAC A++) & Bar Council of India</h4>
      <h2>Welcome to College Portal</h2>

      <div className="button-group">
        <button onClick={() => handleSelect("new")}>New Admission</button>
        <button onClick={() => handleSelect("existing")}>Existing Student</button>
      </div>
    </div>
  </div>
</div>

  );
};

export default LandingPage;
