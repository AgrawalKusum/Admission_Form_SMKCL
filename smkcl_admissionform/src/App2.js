import {useState, useEffect} from 'react';
import './App.css';
import Auth from './components/Auth';
import {db, storage} from './config/firebase';
import {collection, getDocs} from 'firebase/firestore';
import {ref, uploadBytes} from 'firebase/storage';


function App() {
  const [studentData, setStudentData] = useState([]);

  const [fileUpload, setFileUpload]=useState(null);

  const studentCollectionRef=collection(db, "test_collection");
  useEffect(() => {
    const getStudentData = async () => {
      try{
      const data=await getDocs(studentCollectionRef);
      const filteredData = data.docs.map((doc) => ({...doc.data(), id: doc.id}));
      setStudentData(filteredData);
      console.log(filteredData);
      }catch (error) {
        console.error("Error fetching student data:", error);
      }
  };
   getStudentData();
  }, []);

  const uploadFile = async () => {
    if (!fileUpload) {
      console.error("No file selected for upload");
      return;
    }
  
    const filesFolderRef = ref(storage,`CandidatePhotos/${fileUpload[0].name}`);
    try{
    await uploadBytes(filesFolderRef, fileUpload);
    }catch(err){
      console.error("Error uploading file:", err);
    }
  };
  
      return (
    <div className="App">
      <Auth />
      <div>
        {studentData.map((student) => (
          <div>
            <h1>{student.Name}</h1>
          </div>))}
      </div>
      <div>
        <input type="file" onChange={(e)=>setFileUpload(e.target.files)}/>
        <button onClick={uploadFile}>Upload</button>
      </div>
    </div>
  );
}

export default App;
