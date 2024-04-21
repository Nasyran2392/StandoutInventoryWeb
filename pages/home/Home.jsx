import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import "./home.scss";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { Link } from "react-router-dom";
import Ongoing from "../../components/datatable/Ongoing";

const Home = () => {
  const [inventory, setInventory] = useState([]);
  const [stockInPendingCount, setStockInPendingCount] = useState(0);
  const [stockOutPendingCount, setStockOutPendingCount] = useState(0);
  const [stockInTasksCount, setStockInTasksCount] = useState(0);
  const [stockOutTasksCount, setStockOutTasksCount] = useState(0);
  const [stockOutStatusCounts, setStockOutStatusCounts] = useState([]);
  const [stockInStatusCounts, setStockInStatusCounts] = useState([]);

  useEffect(() => {
    const unsubscribeInventory = onSnapshot(collection(db, "inventory"), (snapshot) => {
      const inventoryData = [];
      snapshot.forEach((doc) => {
        inventoryData.push({ id: doc.id, ...doc.data() });
      });
      setInventory(inventoryData);
    });

    const stockInQuery1 = query(collection(db, "StockInTasks"), where("status", "==", "Pending"));
    const unsubscribeStockIn1 = onSnapshot(stockInQuery1, (snapshot) => {
      setStockInPendingCount(snapshot.size);
    });

    const stockInQuery2 = query(collection(db, "StockInTasks"), where("status", "in", ["Pick-Up", "Store-In", "Waiting"]));
    const unsubscribeStockIn2 = onSnapshot(stockInQuery2, (snapshot) => {
      setStockInTasksCount(snapshot.size);
    });

    const stockOutQuery1 = query(collection(db, "StockOutTasks"), where("status", "==", "Pending"));
    const unsubscribeStockOut1 = onSnapshot(stockOutQuery1, (snapshot) => {
      setStockOutPendingCount(snapshot.size);
    });

    const stockOutQuery2 = query(collection(db, "StockOutTasks"), where("status", "in", ["Packing", "Delivery", "Waiting"]));
    const unsubscribeStockOut2 = onSnapshot(stockOutQuery2, (snapshot) => {
      setStockOutTasksCount(snapshot.size);
    });

    // Fetch data for Task 5
    const stockOutQuery3 = collection(db, "StockInTasks");
    const unsubscribeStockOut3 = onSnapshot(stockOutQuery3, (snapshot) => {
      const statusCounts = {};
      snapshot.forEach((doc) => {
        const status = doc.data().status;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      setStockOutStatusCounts(statusCounts);
    });

    // Fetch data for Task 6
    const stockInQuery3 = collection(db, "StockOutTasks");
    const unsubscribeStockIn3 = onSnapshot(stockInQuery3, (snapshot) => {
      const statusCounts = {};
      snapshot.forEach((doc) => {
        const status = doc.data().status;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      setStockInStatusCounts(statusCounts);
    });

    return () => {
      unsubscribeInventory();
      unsubscribeStockIn1();
      unsubscribeStockIn2();
      unsubscribeStockOut1();
      unsubscribeStockOut2();
      unsubscribeStockOut3();
      unsubscribeStockIn3();
    };
  }, []);

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Navbar />
        <div className="inventoryContainer">
          <div className="inventoryCard">
            <h3>Critical Products</h3>
            <div className="inventoryGraphs">
            {inventory
              .filter(item => ((item.quantity / item.maxAmount) * 100) < 40)
              .map((item) => (
                <div className="inventoryItem" key={item.id}>
                  <div className="progressCircle">
                    <svg className="progressSvg" viewBox="0 0 32 32">
                      <circle className="progressBarBackground" cx="16" cy="16" r="14" />
                      <circle className="progressBarStroke" cx="16" cy="16" r="14" style={{ strokeDasharray: getDashArray(item.quantity, item.maxAmount), stroke: getColor(item.quantity, item.maxAmount) }} />
                    </svg>
                    <div className="progressNumber">
                      {((item.quantity / item.maxAmount) * 100).toFixed(2)}%
                    </div>
                    <div className="productName" title={item.productName}>
                      {item.productName}
                    </div>
                  </div>
                </div>
              ))}
          </div>


            <div className="inventoryDataTable">
          <h3>Normal Products (60%)</h3>
          <table>
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Product Name</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
            {inventory.slice(0, 10).filter(item => ((item.quantity / item.maxAmount) * 100) >= 60).map((item) => (
              <tr key={item.id}>
                <td>
                  <img src={item.img} alt="Avatar" width="50" height="50" />
                </td>
                <td>{item.productName}</td>
                <td>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${((item.quantity / item.maxAmount) * 100).toFixed(2)}%`, backgroundColor: getColor(item.quantity, item.maxAmount) }}>
                      {((item.quantity / item.maxAmount) * 100).toFixed(2)}%
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          </table>

          <Link to="/product" className="link">
          <button className="seemorebutton">See More</button>
          </Link>

        </div>
          </div>
          <div className="pendingTaskCard">
            <div className="pendingTaskContent">
              <h3>Pending Tasks</h3>
              <h4>
                Stock-In<span className="space"></span>Stock-Out
              </h4>
              <div className="pendingTaskGrid">
                <div className="pendingTaskItem">Pending<h2 className="stockpendingcount">{stockInPendingCount}</h2></div>
                <div className="pendingTaskItem">In-Progress<h2 className="stockinprogresscount">{stockInTasksCount}</h2></div>
                <div className="pendingTaskItem">Pending<h2 className="stockpendingcount">{stockOutPendingCount}</h2></div>
                <div className="pendingTaskItem">In-Progress<h2 className="stockinprogresscount">{stockOutTasksCount}</h2></div>
              </div>
              <div className="pendingTaskGrid2">
                <div className="pendingTaskItem">
                  <table>
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                    {Object.entries(stockOutStatusCounts)
                      .filter(([status, count]) => status !== "Approved" && status !== "Rejection Confirmed")
                      .map(([status, count]) => (
                        <tr key={status}>
                          <td>{status}</td>
                          <td>{count}</td>
                        </tr>
                      ))}
                  </tbody>


                  </table>
                </div>
                <div className="pendingTaskItem">
                  <table>
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>


                  {Object.entries(stockInStatusCounts)
                    .filter(([status, count]) => status !== "Approved" && status !== "Rejection Confirmed")
                    .map(([status, count]) => (
                      <tr key={status}>
                        <td>{status}</td>
                        <td>{count}</td>
                      </tr>
                    ))}
                </tbody>


                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Ongoing />
      </div>
    </div>
  );
};

const getColor = (quantity, maxAmount) => {
  const percentage = (quantity / maxAmount) * 100;
  if (percentage >= 70) {
    return 'rgba(77, 209, 61)';
  } else if (percentage >= 40) {
    return 'orange';
  } else {
    return 'rgba(255, 0, 0, 0.7)';
  }
};

const getDashArray = (quantity, maxAmount) => {
  const percentage = (quantity / maxAmount) * 100;
  const dashLength = Math.PI * 2 * 14 * (percentage / 100);
  const gapLength = Math.PI * 2 * 14 * ((100 - percentage) / 100);
  return `${dashLength} ${gapLength}`;
};

export default Home;
