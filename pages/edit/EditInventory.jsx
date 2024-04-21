import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { productInputs } from '../../formSource'; // Import productInputs from formSource

const EditInventory = () => {
  const [file, setFile] = useState("");
  const { userId } = useParams();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [imageURL, setImageURL] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const docRef = doc(db, 'inventory', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
          setImageURL(docSnap.data().img || "");
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
      let newUserData = { ...userData };
      
      // Parse quantity value to a number
      if (userData.quantity) {
        newUserData.quantity = parseInt(userData.quantity);
        if (isNaN(newUserData.quantity)) {
          throw new Error("Quantity must be a number.");
        }
      }
  
      // Parse maxAmount value to a number
      if (userData.maxAmount) {
        newUserData.maxAmount = parseInt(userData.maxAmount);
        if (isNaN(newUserData.maxAmount)) {
          throw new Error("Max Amount must be a number.");
        }
      }
  
      if (file) {
        const storageRef = getStorage();
        const fileRef = ref(storageRef, file.name);
        await uploadBytes(fileRef, file);
        newUserData = { ...newUserData, img: await getDownloadURL(fileRef) };
      }
  
      const docRef = doc(db, 'inventory', userId);
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
          <h1>Update User</h1>
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
              {productInputs.map((input) => (
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
                Update Product
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInventory;
