// StockInTasks.js
import "./StockInTasks.scss"
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import emailjs from 'emailjs-com';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import SelectProductTable from '../../components/datatable/SelectProductTable';
import { useNavigate } from "react-router-dom";

const StockInTasks = ({ inputs, title }) => {
  const [data, setData] = useState({});
  const [storekeepers, setStorekeepers] = useState([]);
  const [client, setClient] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({});
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false); // State for modal visibility

  useEffect(() => {
    const fetchStorekeepers = async () => {
      try {
        const storekeepersRef = collection(db, 'users');
        const snapshot = await getDocs(storekeepersRef);
        const storekeeperList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStorekeepers(storekeeperList);
      } catch (err) {
        console.log(err);
      }
    };

    fetchStorekeepers();
  }, []);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const clientRef = collection(db, 'client');
        const snapshot = await getDocs(clientRef);
        const clientList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClient(clientList);
      } catch (err) {
        console.log(err);
      }
    };

    fetchClient();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const inventoryRef = collection(db, 'inventory');
        const snapshot = await getDocs(inventoryRef);
        const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productList);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, []);

  const handleInput = (e) => {
    const { id, value } = e.target;

    // For storekeeper and client selection
    if (id === "assignedStorekeeperId" || id === "assignedClientId") {
      const selectedIndex = e.target.selectedIndex;
      const selectedOption = e.target.options[selectedIndex];
      const name = selectedOption.text;

      setData(prevData => ({
        ...prevData,
        [id]: value,
        [`${id}Name`]: name, // Add name field for storekeeper and client
      }));
    } else {
      setData(prevData => ({
        ...prevData,
        [id]: value
      }));
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
  
    // Check if required fields are filled in
    if (!data.assignedStorekeeperId || !data.assignedClientId) {
      alert('Please select storekeeper and client.'); // You can show a more user-friendly message
      return;
    }
  
    // Check if at least one product is selected
    if (Object.keys(selectedProducts).length === 0) {
      alert('Please select at least one product.'); // You can show a more user-friendly message
      return;
    }
  
    // Fetch the email of the selected storekeeper from Firestore
    try {
      const storekeeperRef = doc(db, 'users', data.assignedStorekeeperId);
      const clientRef = doc(db, 'client', data.assignedClientId);
      

      const storekeeperDoc = await getDoc(storekeeperRef);
      const clientDoc = await getDoc(clientRef);
      
      
      const storekeeperEmail = storekeeperDoc.data().email;
      const storekeeperName = storekeeperDoc.data().displayName;
      const clientName = clientDoc.data().name;
      const clientAddress = clientDoc.data().address;
      
  
      // Send email to the storekeeper using EmailJS
      await emailjs.send('service_xhuz367', 'template_a7pkaf7', {
        to_email: storekeeperEmail,
        to_name: storekeeperName, 
        to_address: clientAddress,
        to_client: clientName,
        status: "Pending", // Updated status
        to_numberOrder : data.noOrder, 
        dueDate : data.dueDate,
        // Add other template variables here if needed
      }, 'aemImAt97yfG8FOEK');
  
      // Proceed with adding the task to the database
      const newData = {
        ...data,
        selectedProducts: Object.entries(selectedProducts).map(([productId, quantity]) => ({ productId, quantity })),
        status: "Pending",
        timestamp: serverTimestamp(),
      };
  
      // Add both ID and name fields to the database
      newData.assignedStorekeeperName;
      newData.assignedClientName;
  
      await addDoc(collection(db, 'StockInTasks'), newData);
      setData({});
      setSelectedProducts({});
      // navigate(-1);
      setShowModal(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate(-1);
  };
  

  return (
    <div className="newproduct">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>{title}</h1>
        </div>
        <div className="bottom">
          <div className="rights">
            <form onSubmit={handleAddItem}>
              <div className="formInput">
                <label htmlFor="assignedStorekeeperId">Assigned Storekeeper:</label>
                <select
                  id="assignedStorekeeperId"
                  onChange={handleInput}
                >
                  <option value="">Select Storekeeper</option>
                  {storekeepers.map(storekeeper => (
                    <option key={storekeeper.id} value={storekeeper.id}>{storekeeper.displayName}</option>
                  ))}
                </select>
              </div>

              <div className="formInput">
                <label htmlFor="assignedClientId">Assigned Client:</label>
                <select
                  id="assignedClientId"
                  onChange={handleInput}
                >
                  <option value="">Select Client</option>
                  {client.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              {inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input
                    id={input.id}
                    type={input.type}
                    value={input.value}
                    placeholder={input.placeholder}
                    //style={input.style} // Apply inline styles here
                    onChange={handleInput}
                  />
                </div>
              ))}
              <button type="submit">
                Send
              </button>
            </form>
          </div>
        </div>
        <SelectProductTable
          products={products}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
        />
      </div>

      {showModal && (
  <div className="modal">
    <div className="modal-content">
      <span className="close" onClick={handleCloseModal}>&times;</span>
      <p className="sentence1">This task will send a notification email to the storekeeper </p>
            <p className="sentence2"> Note:</p>
            <p className="sentence3"> Note: Quantity will update after the storekeeper done the task.</p>
      <div className="modal-buttons">
        <button onClick={handleCloseModal}>Ok</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
  
};

export default StockInTasks;
