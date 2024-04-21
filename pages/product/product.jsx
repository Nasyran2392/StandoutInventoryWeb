import "./product.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import ProductTable from "../../components/datatable/ProductTable"

const product = () => {
  return (
    <div className="product">
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        <ProductTable/>
      </div>
    </div>
  )
}

export default product