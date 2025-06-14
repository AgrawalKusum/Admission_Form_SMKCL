import React, { useState } from 'react';
import { db, storage } from './config/firebase';
import { collection,doc,setDoc, getDocs, query, where, runTransaction} from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { Timestamp } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";


function AdmissionForm() {
  const navigate = useNavigate();
  const [files, setFiles] = useState({});
  const [status, setStatus] = useState('');
  const [formData, setFormData] = useState({
    Caste :"",
    Category : "",
    Course : "",
    DOB : "",
    District : "",
    Gender : "",
    PINcode : "",
    Religion : "",
    Session : "2025-26",
    State : "",
    aadharNo : "",
    address : "",
    candidateMobile1: "",
    candidateMobile2: "",
    candidateName: "",
    city: "",
    course1: "10th",
    course2: "12th",
    course3: "",
    course4: "",
    course5: "",
    email_Id: "",
    fatherName: "",
    finalYearMarksheet_Sr_No1: "",
    finalYearMarksheet_Sr_No2: "",
    finalYearMarksheet_Sr_No3: "",
    finalYearMarksheet_Sr_No4: "",
    finalYearMarksheet_Sr_No5: "",
    marksObtained1: "",
    marksObtained2: "",
    marksObtained3: "",
    marksObtained4: "",
    marksObtained5: "",
    maxMarks1: "",
    maxMarks2: "",
    maxMarks3: "",
    maxMarks4: "",
    maxMarks5: "",
    mediumOfStudy: "",
    motherName: "",
    parentMobile: "",
    percentage1: "",
    percentage2: "",
    percentage3: "",
    percentage4: "",
    percentage5: "",
    remarks: "",
    stateOfDomicile: "",
    subjects1: "",
    subjects2: "",
    subjects3: "",
    subjects4: "",
    subjects5: "",
    university1: "",
    university2: "",
    university3: "",
    university4: "",
    university5: "",
    yearOfPassing1: "",
    yearOfPassing2: "",
    yearOfPassing3: "",
    yearOfPassing4: "",
    yearOfPassing5: "",
  });

  const folderNameMap = {
  1: '10th',
  2: '12th',
  3: 'UG',
  4: 'PG',
  5: 'Other',
  6: 'photo',
  7: 'signature',
  8: 'casteCertificate'
};
  const fileSizeLimits = {
  1: 0.1,
  2: 0.1,
  3: 0.1,
  4: 0.1,
  5: 0.1,
  6: 0.05,
  7: 0.05,
  8: 0.1
};
  const uploadFileToFirebase = async (file, folderName, studentId, candidateName) => {
    if (!file || !folderName || !studentId || !candidateName) {
      throw new Error("Missing required parameters");
    }

    const ext = file.name.split('.').pop();
    const cleanName = candidateName.trim().replace(/\s+/g, '_'); // avoid spaces in file name

    const filename = `${studentId}_${cleanName}_${folderName}.${ext}`;
    const storagePath = `${folderName}/${filename}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, file);

    return storagePath;
  };

  const handleFileChange = (e, row) => {
    const file = e.target.files[0];
    if (file) {
      const maxSizeMB = fileSizeLimits[row];
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      if (file.size > maxSizeBytes) {
        alert(`File is too large. Maximum allowed is ${maxSizeMB} MB.`);
        e.target.value = '';
        return;
      }
    setFiles((prev) => ({ ...prev, [row]: file }));
  };
  }
  const uploadAllfiles = async (studentId) => {
    const uploadResults = {};

    for (let i = 1; i <= 8; i++) {
      if (files[i]) {
        const folderKey = folderNameMap[i];
        const filePath = await uploadFileToFirebase(
          files[i],
          folderKey,
          studentId,
          formData.candidateName
        );
        uploadResults[`file_${folderKey}`] = filePath;
      }
    }

    return uploadResults;
  };

  const handleChange=(e)=>{
    const { name, value } = e.target;
    try{
      setFormData((prev) => {
        const updated = { ...prev, [name]: value };

        for (let i = 1; i <= 5; i++) {
          const marksKey = `marksObtained${i}`;
          const maxKey = `maxMarks${i}`;
          const percentKey = `percentage${i}`;

          const marks = parseFloat(updated[marksKey]);
          const max = parseFloat(updated[maxKey]);

          if (!isNaN(marks) && !isNaN(max) && max > 0) {
            updated[percentKey] = ((marks / max) * 100).toFixed(2);
          }
        }

        return updated;
      });
    }catch(err){
      console.error("Error updating form data:", err);
    }
  };
  const generateStudentId =async (Course, Session) => {
    const prefix = Course.trim().slice(0, 1).toUpperCase();
    const year = Session.slice(2, 4);

    const baseId = `${prefix}${year}`;

    const counterRef=doc(db, 'counters', baseId);
    try{
      const newId=await runTransaction(db,async (transaction)=>{
        const counterDoc=await transaction.get(counterRef);

        let count =1;
        if(counterDoc.exists()){
          count = counterDoc.data().count+1;
        }
        transaction.set(counterRef, {count},{merge:true});
        const padded=count.toString().padStart(3,"0");
        return `${baseId}${padded}`;
      });
      return newId;
    }catch(e){
      console.error("Transaction failed", e);
      throw new Error("Failed to generate student ID");
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();    
    
    try {
      const studentId = await generateStudentId(formData.Course, formData.Session);
      const candidateName = formData.candidateName.trim();
      const Course=formData.Course;
      const Session=formData.Session;
      setStatus('Submitting...');

      const numericFields = [
        'aadharNo', 'PINcode',
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

      const fileUrls = await uploadAllfiles(studentId);

      const finalData = {
        ...cleanedData,
        studentId,
        fileUrls,
        submittedAt: new Date()};

      await setDoc(doc(db, "students", studentId), finalData);

      setStatus('Submitted successfully!');
      console.log('Form submitted successfully');
      navigate("/success", {state: { studentId, candidateName, Course, Session }});
    } catch (error) {
      console.error(error);
      setStatus('Submission failed.');
    }
  };

  

  return (
    <div>
      <h1>SMT. MOHAN KAUR COLLEGE OF LAW</h1>
      <h2><u>Admission Form</u></h2>
      <form onSubmit={handleSubmit}>

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
                title="Enter your 12-digit AADHAR number"
                inputMode="numeric"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, '');
                }}
                required
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
                <th>Final Year Marksheet Sr. No.</th>
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
                      />
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
              <input
                type="file"
                name="photo"
                accept="image/*"
                title="Max 50KB. Allowed: .jpg, .jpeg, .png"
                required
                onChange={(e) => handleFileChange(e, 6)}
              />
              <small>Max size: 50 KB</small>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
              <label>Upload Signature:<span style={{ color: 'red' }}>*</span></label>
              <input
                type="file"
                name="signature"
                accept="image/*"
                title="Max 50KB. Allowed: .jpg, .jpeg, .png"
                required
                onChange={(e) => handleFileChange(e, 7)}
              />
              <small>Max size: 50 KB</small>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
              <label>Upload Caste Certificate:</label>
              <input
                type="file"
                name="casteCertificate"
                accept="image/*"
                title="Max 100KB. Allowed: .pdf, .jpg, .jpeg, .png"
                onChange={(e) => handleFileChange(e, 8)}
              />
              <small>Max size: 100 KB</small>
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

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
export default AdmissionForm;