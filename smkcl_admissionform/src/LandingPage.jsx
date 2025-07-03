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

            {/* Right Half */}
            <div className="card-right">
            <h1>Smt. Mohan Kaur College Of Law</h1>
            <h4>Affiliated to CCS University, Meerut (NAAC A++) & Bar Council of India</h4>
            <h2>Welcome to College Portal</h2>

            </div>
            {/* Left Half */}
            <div className="card-left">
                <div className="card-instructions">
                <p>Please read the instructions carefully before starting the admission form.</p>
                
                <h3>Required Documents:</h3>
                <ul>
                <li>Passport-size Photograph (.jpg/.jpeg/.png, Max 500KB)</li>
                <li>Signature (.jpg/.jpeg/.png, Max 500KB)</li>
                <li>10th & 12th Mark Sheets, Graduation Mark Sheets (only LLB applicants) (.pdf/.jpg/.jpeg/.png, Max 500KB each)</li>
                <li>Caste Certificate (if applicable) (.pdf/,jpg/.jpeg/.png, Max 500KB)</li>
                <li>Aadhar Card(.pdf/jpg/jpeg/.png, Max 500KB each)</li>
                </ul>
                <p>Ensure all documents are clearly scanned and meet the file format & size limits.</p>

                <div className="button-group">
                    <button onClick={() => handleSelect("new")}>New Admission</button>
                    <button onClick={() => handleSelect("existing")}>Existing Student</button>
                </div>
            </div>
            </div>
        </div>
    </div>

  );
};

export default LandingPage;
