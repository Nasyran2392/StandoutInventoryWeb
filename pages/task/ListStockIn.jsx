import "./ListStockIn.scss";
import { useState, useEffect } from "react"; 
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import StockInTable from "../../components/datatable/StockInTable";
import ApproveStockIn from "../../components/datatable/ApproveStockIn";
import RejectStockIn from "../../components/datatable/RejectStockIn";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const ListStockIn = () => {
  const [selectedTable, setSelectedTable] = useState("StockInTable");
  const [rowCount, setRowCount] = useState(0);
  const [rowCountStockIn, setRowCountStockIn] = useState(0);
  const [rowCountRejected, setRowCountRejected] = useState(0);

  useEffect(() => {
    const unsubStockIn = onSnapshot(collection(db, "StockInTasks"), (snapShot) => {
      let count = 0;
      snapShot.forEach((doc) => {
        const data = doc.data();
        if (data.status === "Waiting") {
          count++;
        }
      });
      
      setRowCountStockIn(count);
    }, (error) => {
      console.log(error);
    });
    

    return () => {
      unsubStockIn();
    };
  }, []); // Empty dependency array to run the effect only once

  useEffect(() => {
    const unsubStockIn = onSnapshot(collection(db, "StockInTasks"), (snapShot) => {
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
  }, []); // Empty dependency array to run the effect only once

  

  return (
    <div className="ListStockIn">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        
        <div className="tableSelection">
        <button className={selectedTable === "StockInTable" ? "selected" : ""} onClick={() => setSelectedTable("StockInTable")}>
          Stock-In Table {rowCount > 0 && <span className="count1">{rowCount}</span>}
        </button>
        <button className={selectedTable === "ApproveStockIn" ? "selected" : ""} onClick={() => setSelectedTable("ApproveStockIn")}>
          Approve Stock-In {rowCountStockIn > 0 && <span className="count2">{rowCountStockIn}</span>}
        </button>
        <button className={selectedTable === "RejectStockIn" ? "selected" : ""} onClick={() => setSelectedTable("RejectStockIn")}>
          Reject Stock-In {rowCountRejected > 0 && <span className="count3">{rowCountRejected}</span>}
        </button>
      </div>


        {selectedTable === "StockInTable" && <StockInTable onCountChange={setRowCount} />}
        {selectedTable === "ApproveStockIn" && <ApproveStockIn onCountChange={setRowCountStockIn} />}
        {selectedTable === "RejectStockIn" && <RejectStockIn onCountChange={setRowCountRejected}/>}
      </div>
    </div>
  );
};

export default ListStockIn;
