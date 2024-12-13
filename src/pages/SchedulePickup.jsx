import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/SchedulePickup.css";

const SchedulePickup = () => {
  const [items, setItems] = useState({ shirt: 0, pant: 0 });
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const handleQuantityChange = (item, amount) => {
    setItems((prevItems) => ({
      ...prevItems,
      [item]: Math.max(0, prevItems[item] + amount),
    }));
  };

  const handleAddToCart = () => {
    // Save items and address to local storage or state management
    localStorage.setItem("cartItems", JSON.stringify(items));
    localStorage.setItem("address", address);
    navigate("/cart");
  };

  console.log("Schedule Pickup");

  return (
    <div className="schedule-pickup">
      <h2>Schedule Pickup</h2>
      <div className="item">
        <h3>Shirt</h3>
        <button onClick={() => handleQuantityChange("shirt", -1)}>-</button>
        <span>{items.shirt}</span>
        <button onClick={() => handleQuantityChange("shirt", 1)}>+</button>
      </div>
      <div className="item">
        <h3>Pant</h3>
        <button onClick={() => handleQuantityChange("pant", -1)}>-</button>
        <span>{items.pant}</span>
        <button onClick={() => handleQuantityChange("pant", 1)}>+</button>
      </div>
      <div className="address">
        <h3>Address</h3>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
      <button className="add-to-cart" onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
};

export default SchedulePickup;
