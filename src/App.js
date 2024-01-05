import React, { useState } from 'react';
import Swal from "sweetalert2";

const App = () => {
  const [picture, setPicture] = useState({ fileName: "", bytes: "" });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);



  const handlePicture = (event) => {
    const uploadedFile = event.target.files[0];
  
    // Check if a file is selected
    if (uploadedFile) {
      const allowedExtensions = ["txt", "log","json"];
      const fileExtension = uploadedFile.name.split(".").pop().toLowerCase();
  
      // Check if the file extension is allowed
      if (allowedExtensions.includes(fileExtension)) {
        setPicture({
          fileName: URL.createObjectURL(uploadedFile),
          bytes: uploadedFile,
        });
      } else {
        event.target.value = "";
        Swal.fire({
          icon: 'warning',
          text: "Invalid file type. Please upload a .txt or .log file.",
      })
      }
    }
  };
  

  const handleSubmit = async () => {
    if (!picture.bytes) {
      Swal.fire({
        icon: 'warning',
        text: "Please select a file before uploading.",
    })
      return;
    }
    setLoading(true); // Set loading state to true

    var formData = new FormData();
    formData.append("logFile", picture.bytes);

    try {
      const response = await fetch("http://localhost:4000/parseLog", {
        method: "POST",
        mode: "cors",
        body: formData,
      });

      const resultData = await response.json();
      setResult(resultData);

      // Simulate a 5-second delay before triggering the download
      setTimeout(() => {
        setLoading(false); // Set loading state to false
        downloadResult(resultData);
      }, 5000);

    } catch (err) {
      setLoading(false); // Set loading state to false in case of an error
      console.error('Error:', err);
    }
  };

  const downloadResult = (result) => {
    const jsonData = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'result.json';
    link.click();
  };

  return (
    <div>
        <body style={{background:"lightgrey",height:"100vh"}}>
    <div>      
      <label for="exampleInputEmail1" style={{marginTop:"230px",marginLeft:"280px"}}><b>Upload File</b></label>
    <center><input type="file" class="form-control" id="exampleInputEmail1" onChange={handlePicture} style={{width:"60%"}}/></center>
    <br/>
    <center>
      <button onClick={handleSubmit} className='btn btn-success'>Upload</button>   <br></br>
   
      {loading && <p style={{fontSize:"25px"}}>Loading...</p>}
      </center>

    </div>
    </body>
   
    
    </div>
  );
};

export default App;