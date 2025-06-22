import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useFormContext } from "./FormContext";
import { folderNameMap, fileSizeLimits} from './utils';

function AdmissionForm() {
  const { formData, setFormData, files, setFiles } = useFormContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('');

  

  useEffect(() => {
    if (location.state?.formData) { 
      setFormData(location.state.formData);
      localStorage.setItem("formData", JSON.stringify(location.state.formData));
    }else{
      const saveData=localStorage.getItem("formData");
      if(saveData){
        setFormData(JSON.parse(saveData))
      }
    }
  }, [location.state]);

  const handleFileChange = (e, row) => {
    const file = e.target.files[0];
    if (file) {
      const maxSizeKB = fileSizeLimits[row];
      const maxSizeBytes = maxSizeKB * 1024;

      if (file.size > maxSizeBytes) {
        alert(`File is too large. Maximum allowed is ${maxSizeKB} KB.`);
        e.target.value = '';
        return;
      }
    setFiles((prev) => ({ ...prev, [folderNameMap[row]]: file }));
  };
  }

  const handleChange=(e)=>{
    const { name, value } = e.target;
    const fieldsToCapitalize = ['candidateName', 'fatherName', 'motherName', 'address', 'city', 'State', 'District', 'Religion', 'Caste', 'Category', 'stateOfDomicile', 'mediumOfStudy', 'subjects1', 'subjects2', 'subjects3', 'subjects4', 'subjects5', 'course3', 'course4', 'course5','university1', 'university2', 'university3', 'university4', 'university5'];
    const newValue = fieldsToCapitalize.includes(name)
      ? value.toUpperCase()
      : value;
    try{
      setFormData((prev) => {
        const updated = { ...prev, [name]: newValue };

        for (let i = 1; i <= 5; i++) {
          const marksKey = `marksObtained${i}`;
          const maxKey = `maxMarks${i}`;
          const percentKey = `percentage${i}`;

          const marks = parseFloat(updated[marksKey]);
          const max = parseFloat(updated[maxKey]);

          if (!isNaN(marks) && !isNaN(max)) {
            if (max < marks) {
              updated[maxKey + "_error"] = true;
            } else {
              updated[maxKey + "_error"] = false;
              updated[percentKey] = ((marks / max) * 100).toFixed(0);
            }
          }
        }

        return updated;
      });
    }catch(err){
      console.error("Error updating form data:", err);
    }
  };

  const checkDuplicateEntry = async (aadharNo, dob) => {
    try {
      const q = query(
        collection(db, "students"),
        where("aadharNo", "==", Number(aadharNo)),
        where("DOB", "==", new Date(dob))
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error("Error checking for duplicate:", error);
      return false;
    }
  };


  const handlePreview = async (e) =>{
    e.preventDefault();
    setFormData(formData);
    setFiles(files);

    const { aadharNo, DOB } = formData;
    if (!aadharNo || !DOB) {
      alert("Please fill in Aadhar Number and Date of Birth.");
      return;
    }
    const isDuplicate = await checkDuplicateEntry(aadharNo, DOB);
    if (isDuplicate) {
      alert("You have already submitted this form.");
      return;
    }
    console.log("Files before navigating to preview:", files);

    navigate("/preview", { state: { formData, files} });
  }

  return (
    <div>
      <h1>Smt. Mohan Kaur College Of Law</h1>
      <h2><u>Admission Form</u></h2>
      <form onSubmit={handlePreview}>

        <div className="section">
          <div className="row">
            <div>
              <label>
                Session:<span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                name="Session"
                placeholder="Session (e.g. 2025-26)"
                value={formData.Session}
                onChange={handleChange}
                pattern="20\d{2}-\d{2}"
                title="Format: 2025-26 (use hyphen ‘-’)"
                required
              />
            </div>
            <div>
              <label htmlFor="Course">
                Course Applied for:<span style={{ color: 'red' }}>*</span>
              </label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="Course"
                    value="BA.LLB"
                    checked={formData.Course === "BA.LLB"}
                    onChange={handleChange}
                    required
                  />
                  BA.LLB
                </label>
                <label>
                  <input
                    type="radio"
                    name="Course"
                    value="LLB"
                    checked={formData.Course === "LLB"}
                    onChange={handleChange}
                  />
                  LLB
                </label>
              </div>
            </div>
          </div>
        </div>


        <div className="section">
          <h3>Personal Details:</h3>
          <div className="row">
            <div>
              <label>Candidate Name:<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="candidateName"
                placeholder="Candidate Name"
                value={formData.candidateName}
                onChange={handleChange}
                pattern="[A-Za-z\s]+"
                title="Only letters and spaces allowed"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                }}
                required
              />
            </div>
            <div>
              <label>Date of Birth:<span style={{ color: 'red' }}>*</span></label>
              <input
                type="date"
                name="DOB"
                value={formData.DOB || ""}
                onChange={handleChange}
                required
              />
            </div>       
          </div>

          <div className="row">
            <div>
              <label>Father's Name:<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="fatherName"
                placeholder="Father's Name"
                value={formData.fatherName}
                onChange={handleChange}
                pattern="[A-Za-z\s]+"
                title="Only letters and spaces allowed"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                }}
                required
              />
            </div>
            <div>
              <label>Mother's Name:<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="motherName"
                placeholder="Mother's Name"
                value={formData.motherName}
                onChange={handleChange}
                pattern="[A-Za-z\s]+"
                title="Only letters and spaces allowed"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                }}
                required
              />
            </div>
          </div>

          <div className="row">
            <div>
              <label htmlFor="aadhar">Aadhar No.:<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="aadharNo"
                placeholder="Aadhar Number"
                value={formData.aadharNo}
                onChange={handleChange}
                pattern="\d{12}"
                maxLength={12}
                title="Enter your 12-digit APAAR ID number"
                inputMode="numeric"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, '');
                }}
                required
              />
            </div>
            <div>
              <label htmlFor="apaarId">APAAR ID / ABC ID:</label>
              <input
                type="text"
                name="apaarId"
                placeholder="Enter your 12-digit APAAR ID number"
                value={formData.apaarId}
                onChange={handleChange}
                pattern="\d{12}"
                maxLength={12}
                title="Enter your 12-digit APAAR ID number"
                inputMode="numeric"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, '');
                }}
              />
            </div>
            <div>
              <label htmlFor="Gender">Gender:<span style={{ color: 'red' }}>*</span></label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="Gender"
                    value="Male"
                    checked={formData.Gender === "Male"}
                    onChange={handleChange}
                    required
                  />
                  Male
                </label>
                <label>
                  <input
                    type="radio"
                    name="Gender"
                    value="Female"
                    checked={formData.Gender === "Female"}
                    onChange={handleChange}
                  />
                  Female
                </label>
              </div>
            </div>
          </div>
        </div>


        <div className="section">
          <div className="row">
            <div>
              <label>Email Id:<span style={{ color: 'red' }}>*</span></label>
              <input
                type="email"
                name="email_Id"
                placeholder="Email ID"
                value={formData.email_Id}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Candidate Mobile 1:<span style={{ color: 'red' }}>*</span></label>
              <input
                type="tel"
                name="candidateMobile1"
                placeholder="Candidate Mobile 1"
                pattern="[6-9]\d{9}"
                maxLength={10}
                minLength={10}
                value={formData.candidateMobile1}
                onChange={handleChange}
                inputMode="numeric"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, '');
                }}
                required
              />
            </div>
            <div>
              <label>Candidate Mobile 2:</label>
              <input
                type="tel"
                name="candidateMobile2"
                placeholder="Candidate Mobile 2"
                pattern="[6-9]\d{9}"
                maxLength={10}
                minLength={10}
                value={formData.candidateMobile2}
                onChange={handleChange}
                inputMode="numeric"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, '');
                }}
              />
            </div>
          </div>

          <div className="row">
            <div>
              <label>Parent's Mobile:</label>
              <input
                type="tel"
                name="parentMobile"
                placeholder="Parent's Mobile"
                pattern="[6-9]\d{9}"
                maxLength={10}
                minLength={10}
                value={formData.parentMobile}
                onChange={handleChange}
                inputMode="numeric"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, '');
                }}
              />
            </div>
            <div>
              <label>State of Domicile:<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="stateOfDomicile"
                placeholder="Eg: Delhi"
                pattern="[A-Za-z\s]+"
                value={formData.stateOfDomicile}
                onChange={handleChange}
                title="Only letters and spaces allowed"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                }}
                required
              />
            </div>
            <div>
              <label>Medium of Study:<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="mediumOfStudy"
                placeholder="Hindi / English"
                pattern="[A-Za-z\s]+"
                value={formData.mediumOfStudy}
                onChange={handleChange}
                title="Only letters and spaces allowed"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                }}
                required
              />
            </div>
          </div>

          <div className="row">
            <div>
              <label>Religion:<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="Religion"
                placeholder="Religion"
                pattern="[A-Za-z\s]+"
                value={formData.Religion}
                onChange={handleChange}
                title="Only letters and spaces allowed"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                }}
                required
              />
            </div>
            <div>
              <label>Caste:<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="Caste"
                placeholder="Caste"
                pattern="[A-Za-z\s]+"
                value={formData.Caste}
                onChange={handleChange}
                title="Only letters and spaces allowed"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                }}
                required
              />
            </div>
            <div>
              <label>Category:<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="Category"
                placeholder="GEN / SC / ST / OBC / OTHER"
                pattern="[A-Za-z\s]+"
                value={formData.Category}
                onChange={handleChange}
                title="Only letters and spaces allowed"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                }}
                required
              />
            </div>
          </div>
        </div>


        <div className="section">
          <h3>Address:</h3>

          <div className="row">
            <div>
              <label htmlFor="address_line">House No, Locality, Landmark:</label>
              <textarea
                rows="2"
                name="address"
                placeholder="Eg: H.No 23A, Gandhi Nagar, Near Post Office"
                value={formData.address}
                onChange={handleChange}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^A-Za-z0-9\s,\/.-]/g, '');
                }}
              />
            </div>
          </div>

          <div className="row">
            <div>
              <label htmlFor="city">City / Town:<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="city"
                placeholder="Eg: New Delhi"
                value={formData.city}
                pattern="[A-Za-z\s]+"
                onChange={handleChange}
                title="Only letters and spaces allowed"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                }}
                required
              />
            </div>

            <div>
              <label htmlFor="district">District:<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="District"
                placeholder="Eg: Baghpat"
                value={formData.District}
                pattern="[A-Za-z\s]+"
                onChange={handleChange}
                title="Only letters and spaces allowed"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                }}
                required
              />
            </div>

            <div>
              <label htmlFor="state">State:<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="State"
                placeholder="Eg: Delhi"
                value={formData.State}
                pattern="[A-Za-z\s]+"
                onChange={handleChange}
                title="Only letters and spaces allowed"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                }}
                required
              />
            </div>

            <div>
              <label htmlFor="pincode">PIN Code:<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="PINcode"
                placeholder="6-Digit PIN Code"
                maxLength={6}
                minLength={6}
                value={formData.PINcode}
                pattern="\d{6}"
                onChange={handleChange}
                inputMode="numeric"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, '');
                }}
                required
              />
            </div>
          </div>
        </div>
         

        <div className="section">
          <h3>Qualification Details:</h3>
          <table border="1" style={{ marginTop: '20px', width: '100%' }}>
            <thead>
              <tr>
                <th>Sr No.</th>
                <th>Course Name</th>
                <th>Stream/Subject</th>
                <th>Board/University</th>
                <th>Year of Passing</th>
                <th>Marks Obtained</th>
                <th>Maximum Marks</th>
                <th>Percentage</th>
                <th>Final Year Marksheet Serial. No.</th>
                <th>Upload Marksheet <small style={{ color: 'gray' }}>Max size: 100KB. Allowed: .jpg, .jpeg, .png</small></th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => {
                const isRequired = i=== 1 || i === 2;
                return (
                  <tr key={i}>
                    <td>{i}</td>
                    <td>
                      <input
                        name={`course${i}`}
                        value={formData[`course${i}`]}
                        onChange={handleChange}
                        required={isRequired}
                        readOnly={isRequired}
                      />
                    </td>
                    <td>
                      <input
                        name={`subjects${i}`}
                        value={formData[`subjects${i}`]}
                        onChange={handleChange}
                        required={isRequired}
                      />
                    </td>
                    <td>
                      <input
                        name={`university${i}`}
                        value={formData[`university${i}`]}
                        onChange={handleChange}
                        required={isRequired}
                      />
                    </td>
                    <td>
                      <input
                        maxLength={4}
                        minLength={4}
                        placeholder='YYYY'
                        pattern="\d{4}"
                        name={`yearOfPassing${i}`}
                        type="number"
                        value={formData[`yearOfPassing${i}`]}
                        inputMode="numeric"
                        onInput={(e) => {
                          e.target.value = e.target.value.replace(/\D/g, '');
                        }}
                        onChange={handleChange}
                        required={isRequired}
                      />
                    </td>
                    <td>
                      <input
                        name={`marksObtained${i}`}
                        type="number"
                        value={formData[`marksObtained${i}`]}
                        onChange={handleChange}
                        required={isRequired}
                      />
                    </td>
                    <td>
                      <input
                        name={`maxMarks${i}`}
                        type="number"
                        value={formData[`maxMarks${i}`]}
                        onChange={handleChange}
                        required={isRequired}
                        className={formData[`maxMarks${i}_error`] ? 'invalid' : ''}
                      />
                      {formData[`maxMarks${i}_error`] && (
                        <small className="error-text">Max Marks must be ≥ Marks Obtained</small>
                      )}
                    </td>
                    <td>
                      <input
                        name={`percentage${i}`}
                        type="number"
                        value={formData[`percentage${i}`]}
                        onChange={handleChange}
                        required={isRequired}
                        readOnly
                      />
                    </td>
                    <td>
                      <input
                        name={`finalYearMarksheet_Sr_No${i}`}
                        value={formData[`finalYearMarksheet_Sr_No${i}`]}
                        onChange={handleChange}
                        required={isRequired}
                      />
                    </td>
                    <td>
                      <input
                        type="file"
                        name={`marksheet${i}`}
                        accept=".pdf, .jpg, .jpeg, .png"
                        onChange={(e)=> handleFileChange(e,i)}
                        title="Max 100KB. Allowed: .pdf, .jpg, .jpeg, .png"
                        required={isRequired}/>
                        
                    </td>
                  </tr>
              );
              })}
            </tbody>
          </table>
        </div>
        <div className="section">
          <div className="row">
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
              <label>Upload Photo:<span style={{ color: 'red' }}>*</span></label>
              <small>Max size: 50 KB</small>
              <input
                type="file"
                name="photo"
                accept="image/*"
                title="Max 50KB. Allowed: .jpg, .jpeg, .png"
                required
                onChange={(e) => handleFileChange(e, 6)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
              <label>Upload Signature:<span style={{ color: 'red' }}>*</span></label>
              <small>Max size: 50 KB</small>
              <input
                type="file"
                name="signature"
                accept="image/*"
                title="Max 50KB. Allowed: .jpg, .jpeg, .png"
                required
                onChange={(e) => handleFileChange(e, 7)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
              <label>Upload Caste Certificate:</label>
              <small>Max size: 100 KB</small>
              <input
                type="file"
                name="casteCertificate"
                accept="image/*"
                title="Max 100KB. Allowed: .pdf, .jpg, .jpeg, .png"
                onChange={(e) => handleFileChange(e, 8)}
              />
            </div>
          </div>
        </div>

        <div className="section">
          <label>Remarks (if any):</label>
          <input
            type="text"
            name="Remarks"
            value={formData.Remarks}
            pattern="[A-Za-z\s]+"
            title="Only letters and spaces allowed"
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
            }}
          />
        </div>

        <button type="submit">Go to Preview</button>
      </form>
    </div>
  );
}
export default AdmissionForm;