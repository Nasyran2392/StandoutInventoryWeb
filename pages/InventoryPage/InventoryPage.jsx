import React, { useState, useEffect } from 'react';
import { addInventoryItem, getInventoryItems, deleteInventoryItem, uploadImage } from '../../firebase';
import './InventoryPage.scss'; // Import CSS file for styling

const InventoryPage = () => {
    const [inventory, setInventory] = useState([]);
    const [newItem, setNewItem] = useState({
        productName: '',
        productId: '',
        quantity: 0,
        price: 0.0,
        stockAmount: 0,
        category: '',
        shelfLocation: '',
        imageFile: null, // Store the selected file
        imageUrl: '' // Store the image URL for preview
    });

    useEffect(() => {
        const fetchInventory = async () => {
            const inventoryData = await getInventoryItems();
            setInventory(inventoryData);
        };
        fetchInventory();
    }, []);

    const handleAddItem = async () => {
        // Upload image file if selected
        if (newItem.imageFile) {
            const imageUrl = await uploadImage(newItem.imageFile);
            setNewItem({ ...newItem, imageUrl });
        }

        await addInventoryItem(newItem);
        setNewItem({
            productName: '',
            productId: '',
            quantity: 0,
            price: 0.0,
            stockAmount: 0,
            category: '',
            shelfLocation: '',
            imageFile: null,
            imageUrl: ''
        });
        const updatedInventory = await getInventoryItems();
        setInventory(updatedInventory);
    };

    const handleDeleteItem = async (id) => {
        await deleteInventoryItem(id);
        const updatedInventory = await getInventoryItems();
        setInventory(updatedInventory);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setNewItem({ ...newItem, imageFile: file });

        // Preview image
        const reader = new FileReader();
        reader.onload = () => {
            setNewItem({ ...newItem, imageUrl: reader.result });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="inventory-container">
            <h1>Inventory Management</h1>
            <div className="add-item-container">
                <h2>Add New Item</h2>
                <input type="text" placeholder="Product Name" value={newItem.productName} onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })} />
                {/* Other input fields for the new item */}
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {newItem.imageUrl && <img src={newItem.imageUrl} alt="Preview" />}
                <button onClick={handleAddItem}>Add</button>
            </div>
            <div className="inventory-list-container">
                <h2>Inventory List</h2>
                <div className="inventory-grid">
                    {inventory && inventory.map(item => (
                        <div key={item.id} className="inventory-item">
                            <div>Name: {item.productName}</div>
                            {/* Render other inventory item details */}
                            <div>
                                <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
                            </div>
                            <div>Image URL: <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">{item.imageUrl}</a></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InventoryPage;
