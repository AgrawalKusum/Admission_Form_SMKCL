import {React, useState, useEffect} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './config/firebase';
import { generateStudentId, uploadAllfiles } from './utils';
import { useFormContext } from "./FormContext";


const PreviewPage = () => {
    const [isConfirmed, setIsConfirmed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { formData,files} = useFormContext();
    const [status, setStatus] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    console.log("PreviewPage received files:", files);


    useEffect(() => {
        if(formData){
          localStorage.setItem("formData",JSON.stringify(formData));
        }
        if (!formData || !files) {
        navigate("/", { replace: true });
        }
    }, [formData, files, navigate]);

    if (!formData || !files) {
        return (
        <div>
            <h2>Invalid Access</h2>
            <p>No form data found. Please fill out the form first.</p>
            <button onClick={() => navigate("/")}>Go Back to Form</button>
        </div>
        );
    }

  const handleEdit = () => {
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setStatus('Submitting...');  
    
    try {
      const studentId = await generateStudentId(formData.Course, formData.Session);
      const candidateName = formData.candidateName.trim();
      const Course=formData.Course;
      const Session=formData.Session;
      setStatus('Submitting...');

      const numericFields = [
        'aadharNo', 'apaarId', 'rollNo','PINcode',
        'candidateMobile1', 'candidateMobile2', 'parentMobile',
        'marksObtained1', 'marksObtained2', 'marksObtained3', 'marksObtained4', 'marksObtained5',
        'maxMarks1', 'maxMarks2', 'maxMarks3', 'maxMarks4', 'maxMarks5',
        'percentage1', 'percentage2', 'percentage3', 'percentage4', 'percentage5',
        'yearOfPassing1', 'yearOfPassing2', 'yearOfPassing3', 'yearOfPassing4', 'yearOfPassing5',
      ];

      const cleanedData = { ...formData };
      numericFields.forEach(field => {
        if (cleanedData[field] !== '') {
          cleanedData[field] = Number(cleanedData[field]);
        }
      });
      if (cleanedData.DOB) {
        cleanedData.DOB = Timestamp.fromDate(new Date(cleanedData.DOB));
      }

      const fileUrls = await uploadAllfiles(files, formData, studentId);

      const finalData = {
        ...cleanedData,
        studentId,
        fileUrls,
        submittedAt: new Date()};

      await setDoc(doc(db, "students", studentId), finalData);

      setStatus('Submitted successfully!');
      console.log('Form submitted successfully');
      navigate("/success", {state: { studentId, candidateName, Course, Session }});
      localStorage.removeItem("formData");

    } catch (error) {
      console.error(error);
      setStatus('Submission failed.');
    }
  };

  if (!formData) return <div>No data to preview</div>;

  return (
    <div>
      <h2>Preview Your Submission</h2>
      <form>
        <div className="section">
            <h3>Uploaded Photo</h3>
            {files.photo ? (
            <img
                src={URL.createObjectURL(files.photo)}
                alt="Photo"
                className="image-preview"
            />
            ) : (
            <div className="readonly-field">No photo uploaded</div>
            )}
        </div>
        <div className="form-section">
            <h3>Uploaded Signature</h3>
            {files.signature ? (
            <img
                src={URL.createObjectURL(files.signature)}
                alt="Signature"
                className="image-preview"
            />
            ) : (
            <div className="readonly-field">No signature uploaded</div>
            )}
        </div>
        <div className="section">
            <div className="row">
                <div>
                <label>
                    Session:
                </label>
                <div className="feild">{formData.Session}</div>
                </div>
                <div>
                <label>
                    Course Applied for:
                </label>
                <div className="feild">{formData.Course}</div>
                </div>
            </div>
            </div>


            <div className="section">
            <div className="row">
                <div>
                <label>Candidate Name:</label>
                <div className="feild">{formData.candidateName}</div>
                </div>
                <div>
                <label>Date of Birth</label>
                <div className="feild">{formData.DOB}</div>
                </div>       
            </div>

            <div className="row">
                <div>
                <label>Father's Name:</label>
                <div className="feild">{formData.fatherName}</div>
                </div>
                <div>
                <label>Mother's Name:</label>
                <div className="feild">{formData.motherName}</div>
                </div>
            </div>

            <div className="row">
                <div>
                <label htmlFor="aadhar">Aadhar No.:</label>
                <div className="feild">{formData.aadharNo}</div>
                </div>
                <div>
                <label htmlFor="apaarId">APAAR ID / ABC ID:</label>
                <div className="feild">{formData.apaarId}</div>
                </div>
                <div>
                <label htmlFor="Gender">Gender:</label>
                <div className="feild">{formData.Gender}</div>
                </div>
            </div>
            </div>


            <div className="section">
            <div className="row">
                <div>
                <label>Email Id:</label>
                <div className="feild">{formData.email_Id}</div>
                </div>
                <div>
                <label>Candidate Mobile 1:</label>
                <div className="feild">{formData.candidateMobile1}</div>
                </div>
                <div>
                <label>Candidate Mobile 2:</label>
                <div className="feild">{formData.candidateMobile2}</div>
                </div>
            </div>

            <div className="row">
                <div>
                <label>Parent's Mobile:</label>
                <div className="feild">{formData.parentMobile}</div>
                </div>
                <div>
                <label>State of Domicile:</label>
                <div className="feild">{formData.stateOfDomicile}</div>
                </div>
                <div>
                <label>Medium of Study:</label>
                <div className="feild">{formData.mediumOfStudy}</div>
                </div>
            </div>

            <div className="row">
                <div>
                <label>Religion:</label>
                <div className="feild">{formData.Religion}</div>
                </div>
                <div>
                <label>Caste:</label>
                <div className="feild">{formData.Caste}</div>
                </div>
                <div>
                <label>Category:</label>
                <div className="feild">{formData.Category}</div>
                </div>
            </div>
            </div>


            <div className="section">
            <h3>Address:</h3>

            <div className="row">
                <div>
                <label>House No, Locality, Landmark:</label>
                <div className="feild">{formData.address}</div>
                </div>
            </div>

            <div className="row">
                <div>
                <label>City / Town:</label>
                <div className="feild">{formData.city}</div>
                </div>

                <div>
                <label>District:</label>
                <div className="feild">{formData.District}</div>
                </div>

                <div>
                <label>State:</label>
                <div className="feild">{formData.State}</div>
                </div>

              <div>
                <label>PIN Code:</label>
                <div className="feild">{formData.PINcode}</div>
              </div>
            </div>
            </div>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "20px" }}>
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                />
                I hereby confirm that the information provided herein by me is accurate, correct and complete and that the documents submitted along with this application form are genuine.
              </label>
            </div>

      <div className="button-row">
        <button onClick={handleEdit}>Edit</button>
        <button onClick={handleSubmit} disabled={!isConfirmed || isSubmitting}>Submit</button>
      </div>
    </form>
  </div>
  );
};

export default PreviewPage;
