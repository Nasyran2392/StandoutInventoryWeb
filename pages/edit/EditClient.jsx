import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { clientInputs } from '../../formSource'; // Import clientInputs from formSource

const EditClient = () => {
  const [file, setFile] = useState("");
  const { userId } = useParams();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [imageURL, setImageURL] = useState("");
  const [clientType, setClientType] = useState(""); // New state for client type
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const docRef = doc(db, 'client', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserData(userData);
          setImageURL(userData.img || "");
          setClientType(userData.clientType || ""); // Set client type from data
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error getting document:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdateUser = async () => {
    try {
      let newUserData = userData;
      if (file) {
        const storageRef = getStorage();
        const fileRef = ref(storageRef, file.name);
        await uploadBytes(fileRef, file);
        newUserData = { ...newUserData, img: await getDownloadURL(fileRef) };
      }
      
      newUserData.clientType = clientType; // Add client type to the updated data

      const docRef = doc(db, 'client', userId);
      await updateDoc(docRef, newUserData);
      console.log('User successfully updated!');

      navigate(-1);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleFileChange = (e) => {
    const imageFile = e.target.files[0];
    setFile(imageFile);
    setImageURL(URL.createObjectURL(imageFile));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>Edit User</h1>
        </div>
        <div className="bottom">
          <div className="left">
            {imageURL ? (
              <img src={imageURL} alt="User avatar" className="avatar" />
            ) : (
              <div className="no-avatar">No Image</div>
            )}
            <label htmlFor="file" className="upload-btn">
              <DriveFolderUploadOutlinedIcon className="icon" />
            </label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
          <div className="right">
            <form>
              <div className="formInput">
                <label htmlFor="clientType">Client Type:</label>
                <select
                  id="clientType"
                  value={clientType}
                  onChange={(e) => setClientType(e.target.value)}
                >
                  <option value="">Select Client Type</option>
                  <option value="Providers">Providers</option>
                  <option value="Stock-Buyers">Stock-Buyers</option>
                  <option value="Providers & Stock-Buyers">Providers & Stock-Buyers</option>
                </select>
              </div>
              {clientInputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label htmlFor={input.id}>{input.label}:</label>
                  <input
                    type={input.type}
                    id={input.id}
                    name={input.id}
                    value={userData[input.id] || ''}
                    onChange={handleInputChange}
                  />
                </div>
              ))}
              <button type="button" onClick={handleUpdateUser}>
                Update User
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditClient;
