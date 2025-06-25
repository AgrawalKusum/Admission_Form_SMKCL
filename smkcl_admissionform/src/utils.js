import { db, storage } from './config/firebase';
import { doc,runTransaction} from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';

 export const folderNameMap = {
  1: '10th',
  2: '12th',
  3: 'UG',
  4: 'PG',
  5: 'Other',
  6: 'photo',
  7: 'signature',
  8: 'casteCertificate',
  9: 'aadharCard',
};

export const fileSizeLimits = {
  1: 500,
  2: 500,
  3: 500,
  4: 500,
  5: 500,
  6: 500,
  7: 500,
  8: 500,
  9: 500
};

  export const uploadFileToFirebase = async (file, folderName, studentId, candidateName) => {
    if (!file || !folderName || !studentId || !candidateName) {
      throw new Error("Missing required parameters");
    }

    const ext = file.name.split('.').pop();
    const cleanName = candidateName.trim().replace(/\s+/g, '_'); // avoid spaces in file name
    const baseFolder = `${studentId}_${cleanName}`;
    const filename = `${studentId}_${cleanName}_${folderName}.${ext}`;
    const storagePath = `${baseFolder}/${filename}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, file);

    return storagePath;
  };

  export const uploadAllfiles = async (files, formData,studentId) => {
    const uploadResults = {};

    for (const [key,file] of Object.entries(files)) {
      const folderKey = key;
      const filePath = await uploadFileToFirebase(
        file,
        folderKey,
        studentId,
        formData.candidateName
        );
      uploadResults[`file_${folderKey}`] = filePath;
    }

    return uploadResults;
  };
 export const generateStudentId =async (Course, Session) => {
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