import "./ClientInfo.scss";
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { db } from '../../firebase';
import Chart from "../../components/chart/Chart";
import { DataGrid } from '@mui/x-data-grid';

const ClientInfo = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [mergedData, setMergedData] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const docRef = doc(db, 'client', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
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

    const unsubStockIn = onSnapshot(collection(db, "StockInTasks"), (snapShot) => {
      let list = [];
      snapShot.docs.forEach((doc) => {
        const data = doc.data();
        list.push({ id: doc.id, ...data, taskType: 'Stock-In' });
      });
      setMergedData(prevState => [...prevState, ...list]);
    }, (error) => {
      console.log(error);
    });

    const unsubStockOut = onSnapshot(collection(db, "StockOutTasks"), (snapShot) => {
      let list = [];
      snapShot.docs.forEach((doc) => {
        const data = doc.data();
        list.push({ id: doc.id, ...data, taskType: 'Stock-Out' });
      });
      setMergedData(prevState => [...prevState, ...list]);
    }, (error) => {
      console.log(error);
    });

    return () => {
      unsubStockIn();
      unsubStockOut();
    };
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'taskType', headerName: 'Task Type', width: 150 },
    { field: 'assignedClientIdName', headerName: 'Client Name', width: 200 },
    { field: 'assignedStorekeeperIdName', headerName: 'Storekeeper', width: 200 },
    { field: 'dueDate', headerName: 'Due Date', width: 200 },
    { field: 'noOrder', headerName: 'Order Number', width: 200 },
    { field: 'status', headerName: 'Status', width: 160},
  ];

  const filteredData = mergedData.filter(item => item.assignedClientIdName === userData.name);

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
                <h1 className="itemTitle">{userData.name}</h1>
                <div className="detailItem">
                  <span className="itemKey">Email:</span>
                  <span className="itemValue">{userData.email}</span>
                </div>

                <div className="detailItem">
                  <span className="itemKey">Client Type:</span>
                  <span className="itemValue">{userData.clientType}</span>
                </div>

                <div className="detailItem">
                  <span className="itemKey">Phone:</span>
                  <span className="itemValue">{userData.phone}</span>
                </div>

                <div className="detailItem">
                  <span className="itemKey">Address:</span>
                  <span className="itemValue">{userData.address}</span>
                </div>

              </div>
            </div>
          </div>
        </div>
        <div className="bottom">
          <h1 className="title">Last Transactions</h1>
          <div className="producttable">
            <div className="productTitle">
              History Task
            </div>
            <DataGrid
              className="datagrid"
              rows={filteredData}
              columns={columns}
              pageSize={9}
              rowsPerPageOptions={[9]}
              checkboxSelection
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientInfo;
