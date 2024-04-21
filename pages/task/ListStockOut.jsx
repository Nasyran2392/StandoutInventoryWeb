import "./ListStockOut.scss";
import { useState, useEffect } from "react"; 
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import StockOutTable from "../../components/datatable/StockOutTable";
import ApproveStockOut from "../../components/datatable/ApproveStockOut";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import RejectStockOut from "../../components/datatable/RejectStockOut";

const ListStockOut = () => {
  const [selectedTable, setSelectedTable] = useState("StockOutTable");
  const [rowCount, setRowCount] = useState(0); // State to hold the row count
  const [rowCountStockOut, setRowCountStockOut] = useState(0); // State to hold the row count for ApproveStockOut
  const [rowCountRejected, setRowCountRejected] = useState(0);


  useEffect(() => {
    const unsubStockOut = onSnapshot(collection(db, "StockOutTasks"), (snapShot) => {
      let count = 0;
      snapShot.forEach((doc) => {
        const data = doc.data();
        if (data.status === "Waiting") {
          count++;
        }
      });
      setRowCountStockOut(count);
    }, (error) => {
      console.log(error);
    });

    return () => {
      unsubStockOut();
    };
  }, []); // Empty dependency array to run the effect only once

  useEffect(() => {
    const unsubStockIn = onSnapshot(collection(db, "StockOutTasks"), (snapShot) => {
      let count = 0;
      snapShot.forEach((doc) => {
        const data = doc.data();
        if (data.status === "Rejected") {
          count++;
        }
      });
      
      setRowCountRejected(count);
    }, (error) => {
      console.log(error);
    });
    

    return () => {
      unsubStockIn();
    };
  }, []); //
  
  return (
    <div className="ListStockOut">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <div className="tableSelection">
        <button className={selectedTable === "StockOutTable" ? "selected" : ""} onClick={() => setSelectedTable("StockOutTable")}>
          Stock-Out Table {rowCount > 0 && <span className="count1">{rowCount}</span>}
        </button>
        <button className={selectedTable === "ApproveStockOut" ? "selected" : ""} onClick={() => setSelectedTable("ApproveStockOut")}>
          Approve Stock-Out {rowCountStockOut > 0 && <span className="count2">{rowCountStockOut}</span>}
        </button>
        <button className={selectedTable === "RejectStockOut" ? "selected" : ""} onClick={() => setSelectedTable("RejectStockOut")}>
          Reject Stock-Out {rowCountRejected > 0 && <span className="count3">{rowCountRejected}</span>}
        </button>
      </div>


        {selectedTable === "StockOutTable" && <StockOutTable onCountChange={setRowCount} />}
        {selectedTable === "ApproveStockOut" && <ApproveStockOut onCountChange={setRowCountStockOut} />}
        {selectedTable === "RejectStockOut" && <RejectStockOut onCountChange={setRowCountRejected}/>}
      </div>
    </div>
  );
};

export default ListStockOut;
