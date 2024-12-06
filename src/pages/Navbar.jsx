import React from "react";
import "./css/Navbar.css";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaUserCircle, FaTools, FaBox } from "react-icons/fa";

function Navbar() {
  const leftNavItems = [
    { name: "Services", icon: <FaTools /> },
    { name: "Contact" },
  ];

  const handleClick = (item) => {
    console.log("Clicked", item);
  };

  return (
    <div className="navbar">
      {/* Logo Section */}
      <div className="navbar-logo">
        <Link to="/" className="logo-link">
          <FaBox size={25} className="logo-icon" />
          <span className="logo-text">IronBox</span>
        </Link>
      </div>

      {/* Left Navigation Items
      <div className="navbar-left">
        <ul className="navbar-list">
          {leftNavItems.map((navItem, index) => (
            <li key={index} onClick={() => handleClick(navItem.name)}>
              <Link to={navItem.name.toLowerCase()} className="nav-item">
                {navItem.icon && (
                  <span className="nav-icon">{navItem.icon}</span>
                )}
                {navItem.name}
              </Link>
            </li>
          ))}
        </ul>
      </div> */}

      {/* Right Navigation Items */}
      <div className="navbar-right">
        <Link to="/cart" className="icon-link">
          <FaShoppingCart size={20} />
        </Link>
        <Link to="/profile" className="icon-link">
          <FaUserCircle size={20} />
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
