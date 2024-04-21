import "./ApproveList.scss";
import { useState, useEffect } from "react"; 
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Approve from "../../components/datatable/Approve";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const ApproveList = () => {

  return (
    <div className="ApproveList">
      <Sidebar />
      <div className="listContainers">
        <Navbar />
        <Approve />
      </div>
    </div>
  );
};

export default ApproveList;
