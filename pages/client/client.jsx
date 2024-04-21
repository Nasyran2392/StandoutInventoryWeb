import "./client.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import ClientTable from "../../components/datatable/ClientTable"

const client = () => {
  return (
    <div className="client1">
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        <ClientTable/>
      </div>
    </div>
  )
}

export default client