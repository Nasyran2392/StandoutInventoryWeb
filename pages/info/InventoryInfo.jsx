import "./InventoryInfo.scss";
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { db } from '../../firebase';
import Chart from "../../components/chart/Chart";
import InventoryTransaction from '../../components/datatable/InventoryTransaction';


const InventoryInfo = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [mergedData, setMergedData] = useState([]);
  const [inventoryTransactions, setInventoryTransactions] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const docRef = doc(db, 'inventory', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
          // Fetch related transactions and merge data
          const stockOutRef = db.collection('StockOutTask').where('selectedProducts', 'array-contains', userId);
          const stockInRef = db.collection('StockInTask').where('selectedProducts', 'array-contains', userId);
          const stockOutSnapshot = await stockOutRef.get();
          const stockInSnapshot = await stockInRef.get();
          const stockOutData = stockOutSnapshot.docs.map(doc => doc.data());
          const stockInData = stockInSnapshot.docs.map(doc => doc.data());
          const mergedData = [...stockOutData, ...stockInData];
          setMergedData(mergedData);
          // Fetch related inventory transactions
          const inventoryTransactionsRef = db.collection('InventoryTransactions').where('productId', '==', userId);
          const inventoryTransactionsSnapshot = await inventoryTransactionsRef.get();
          const inventoryTransactionsData = inventoryTransactionsSnapshot.docs.map(doc => doc.data());
          setInventoryTransactions(inventoryTransactionsData);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  // Calculate percentage
  const percentage = (userData.quantity / userData.maxAmount) * 100;

  // Determine color based on percentage
  let color;
  if (percentage >= 80) {
    color = 'rgba(77, 209, 61)';
  } else if (percentage >= 40) {
    color = 'orange';
  } else {
    color = 'rgba(255, 0, 0, 0.7)';
  }

  // Calculate the dash length
  const dashLength = Math.PI * 2 * 14 * (percentage / 100);

  // Calculate the gap length
  const gapLength = Math.PI * 2 * 14 * ((100 - percentage) / 100);

  // Combine dash length and gap length to form strokeDasharray
  const dashArray = `${dashLength} ${gapLength}`;

  return (
    <div className="single">
      <Sidebar />
      <div className="singleContainer">
        <Navbar />
        <div className="top">
          <div className="left">
            <h1 className="title">Information</h1>
            <div className="item">
              {userData.img ? (
                <img src={userData.img} alt="User avatar" className="itemImg" />
              ) : (
                <div className="no-avatar">No Image</div>
              )}
              <div className="details">
                <h1 className="itemTitle">{userData.productName}</h1>
                <div className="detailItem">
                  <span className="itemKey">Product ID:</span>
                  <span className="itemValue">{userData.productId}</span>
                </div>

                <div className="detailItem">
                  <span className="itemKey">Category:</span>
                  <span className="itemValue">{userData.category}</span>
                </div>

                <div className="detailItem">
                  <span className="itemKey">Description:</span>
                  <span className="itemValue">{userData.description}</span>
                </div>

                <div className="detailItem">
                  <span className="itemKey">Shelf Location:</span>
                  <span className="itemValue">{userData.shelfLocation}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="right">
            <h1 className="title">Percentage</h1>
            <div className="detailItem">
              {/* <span className="itemValue">Quantity: {userData.quantity} / {userData.maxAmount}</span> */}
            </div>
            <div className="circleProgress">
              <svg className="progress" viewBox="0 0 32 32">
                <circle className="progress__background" cx="16" cy="16" r="14" />
                <circle className="progress__value" cx="16" cy="16" r="14" style={{ strokeDasharray: dashArray, stroke: color }} />
              </svg>
              <div className="percentage">{percentage.toFixed(2)}%</div>
              <span className="itemValue">Quantity: {userData.quantity} / {userData.maxAmount}</span>
            </div>
          </div>
        </div>
        <div className="bottom">
          <h1 className="title">Last Transactions</h1>
          <InventoryTransaction data={inventoryTransactions} />
        </div>
      </div>
    </div>
  );
};

export default InventoryInfo;
