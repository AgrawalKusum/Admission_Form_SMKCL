import { createContext, useContext, useState } from "react";

const FormContext = createContext();

export const useFormContext = () => useContext(FormContext);

export const FormProvider = ({ children }) => {
  const [formData, setFormData] = useState({
      Caste :"",
      Category : "",
      Course : "",
      DOB : "",
      District : "",
      Gender : "",
      PINcode : null,
      Religion : "",
      Session : "2025-26",
      State : "",
      aadharNo : null,
      address : "",
      candidateMobile1: null,
      candidateMobile2: null,
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
      marksObtained1: null,
      marksObtained2: null,
      marksObtained3: null,
      marksObtained4: null,
      marksObtained5: null,
      maxMarks1: null,
      maxMarks2: null,
      maxMarks3: null,
      maxMarks4: null,
      maxMarks5: null,
      mediumOfStudy: "",
      motherName: "",
      parentMobile: null,
      percentage1: null,
      percentage2: null,
      percentage3: null,
      percentage4: null,
      percentage5: null,
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
      yearOfPassing1: null,
      yearOfPassing2: null,
      yearOfPassing3: null,
      yearOfPassing4: null,
      yearOfPassing5: null,
      fileUrls: {
        file_10th: "",
        file_12th: "",
        file_UG: "",
        file_PG: "",
        file_Other: "",
        file_photo: "",
        file_signature: "",
        file_casteCertificate: ""
      },
      apaarId: null,
      rollNo: null
    });
  const [files, setFiles] = useState({});

  return (
    <FormContext.Provider value={{ formData, setFormData, files, setFiles }}>
      {children}
    </FormContext.Provider>
  );
};
