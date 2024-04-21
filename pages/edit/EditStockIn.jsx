import "./EditStockIn.scss";
import React, { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import emailjs from "emailjs-com";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import SelectProductTable from "../../components/datatable/SelectProductTable";
import { useParams, useNavigate } from "react-router-dom";
import { stockInInputs } from '../../formSource'; 

const EditStockIn = ({ inputs }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [storekeepers, setStorekeepers] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stockInTaskRef = doc(db, "StockInTasks", id);
        const docSnap = await getDoc(stockInTaskRef);
        const stockInTaskData = docSnap.data();
        setData(stockInTaskData);

        const storekeepersRef = collection(db, "users");
        const storekeepersSnapshot = await getDocs(storekeepersRef);
        const storekeeperList = storekeepersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setStorekeepers(storekeeperList);

        const clientsRef = collection(db, "client");
        const clientsSnapshot = await getDocs(clientsRef);
        const clientList = clientsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setClients(clientList);

        const inventoryRef = collection(db, "inventory");
        const inventorySnapshot = await getDocs(inventoryRef);
        const productList = inventorySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProducts(productList);

        if (stockInTaskData && stockInTaskData.selectedProducts) {
          const selectedProductsData = stockInTaskData.selectedProducts.reduce((acc, curr) => {
            acc[curr.productId] = curr.quantity;
            return acc;
          }, {});
          setSelectedProducts(selectedProductsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  const handleInput = (e) => {
    const { id, value } = e.target;
  
    if (id === "assignedStorekeeperId" || id === "assignedClientId") {
      const selectedIndex = e.target.selectedIndex;
      const selectedOption = e.target.options[selectedIndex];
      const name = selectedOption.text;
  
      setData((prevData) => ({
        ...prevData,
        [id]: value,
        [`${id}Name`]: name,
      }));
    } else {
      setData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!data.assignedStorekeeperId || !data.assignedClientId) {
      alert("Please select storekeeper and client.");
      return;
    }

    if (Object.keys(selectedProducts).length === 0) {
      alert("Please select at least one product.");
      return;
    }

    try {
      const updatedData = {
        ...data,
        selectedProducts: Object.entries(selectedProducts).map(([productId, quantity]) => ({ productId, quantity })),
        timestamp: serverTimestamp(),
      };

      const stockInTaskRef = doc(db, "StockInTasks", id);
      await updateDoc(stockInTaskRef, updatedData);

      alert("Stock in task updated successfully!");
      setData({});
      setSelectedProducts({});
      navigate("/ListStockIn");
    } catch (error) {
      console.error("Error updating stock in task:", error);
    }
  };

  return (
    <div className="editStockIn">
      <Sidebar />
      <div className="editContainer">
        <Navbar />
        <div className="top">
          <h1>Edit Stock In Task</h1>
        </div>
        <div className="bottom">
          <div className="rights">
            <form onSubmit={handleUpdate}>
              <div className="formInput">
                <label htmlFor="assignedStorekeeperId">Assigned Storekeeper:</label>
                <select id="assignedStorekeeperId" onChange={handleInput} value={data.assignedStorekeeperId || ''}>
                  <option value="">Select Storekeeper</option>
                  {storekeepers.map((storekeeper) => (
                    <option key={storekeeper.id} value={storekeeper.id}>
                      {storekeeper.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="formInput">
                <label htmlFor="assignedClientId">Assigned Client:</label>
                <select id="assignedClientId" onChange={handleInput} value={data.assignedClientId || ''}>
                  <option value="">Select Client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              {stockInInputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input
                    type={input.type}
                    id={input.id}
                    name={input.id}
                    value={data[input.id] || ''}
                    onChange={handleInput}
                  />
                </div>
              ))}

              <button type="submit">Update</button>
            </form>
          </div>
        </div>
        <SelectProductTable products={products} selectedProducts={selectedProducts} setSelectedProducts={setSelectedProducts} />
      </div>
    </div>
  );
};

export default EditStockIn;
