import React from "react";
import "./css/Cart.css";
import { FaTrashAlt } from "react-icons/fa";

function Cart() {
  const cartItems = [
    { id: 1, name: "Iron Box", price: 49.99, quantity: 1 },
    { id: 2, name: "Steam Cleaner", price: 89.99, quantity: 2 },
  ];

  const handleRemove = (id) => {
    console.log(`Item with id ${id} removed`);
  };

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  return (
    <div className="cart-container">
      <h1 className="cart-title">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p className="empty-cart">Your cart is empty.</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p>Price: ${item.price.toFixed(2)}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Total: ${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => handleRemove(item.id)}
                >
                  <FaTrashAlt />
                </button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h2>Cart Summary</h2>
            <p>
              <strong>Total:</strong> ${calculateTotal()}
            </p>
            <button className="checkout-btn">Proceed to Checkout</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
