import React from "react";
import { useHistory } from "react-router-dom";
import "./css/Cart.css";

const Cart = () => {
  const items = JSON.parse(localStorage.getItem("cartItems")) || {};
  const address = localStorage.getItem("address") || "";
  const history = useHistory();

  const handleProceedToSubmit = () => {
    history.push("/submit");
  };

  return (
    <div className="cart">
      <h2>Cart</h2>
      <div className="cart-items">
        {Object.keys(items).map((item) => (
          <div key={item} className="cart-item">
            <h3>{item}</h3>
            <p>Quantity: {items[item]}</p>
          </div>
        ))}
      </div>
      <div className="cart-address">
        <h3>Address</h3>
        <p>{address}</p>
      </div>
      <button className="proceed-to-submit" onClick={handleProceedToSubmit}>
        Proceed to Submit
      </button>
    </div>
  );
};

export default Cart;
