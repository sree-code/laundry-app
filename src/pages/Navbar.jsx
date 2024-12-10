import { React, useState, useEffect } from "react";
import "./css/Navbar.css";
import { Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaUserCircle,
  FaTools,
  FaBox,
  FaMapMarkerAlt,
} from "react-icons/fa";

function Navbar() {
  const leftNavItems = [
    { name: "Services", icon: <FaTools /> },
    { name: "Contact" },
  ];

  const [location, setLocation] = useState("");

  useEffect(() => {
    const apiKey = import.meta.env.VITE_APP_OPENCAGE_API_KEY;
    const dummyKey = "skjfkjds";
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${dummyKey}`
          );
          const data = await response.json();
          console.log("Location data:", data);
          setLocation(`Chandapura, India`);
          if (data.results && data.results.length > 0) {
            const { _normalized_city, country } = data.results[0].components;
            setLocation(`${_normalized_city}, ${country}`);
          } else {
            setLocation("Location not found");
            setLocation(`Chandapura, India`);
          }
        } catch (error) {
          console.error("Error fetching location data:", error);
          setLocation("Error fetching location");
        }
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
      setLocation("Geolocation not supported");
    }
  }, []);

  const handleClick = (item) => {
    console.log("Clicked", item);
  };

  return (
    <div className="navbar">
      {/* Logo Section */}
      <div className="navbar-logo">
        <Link to="/" className="logo-link">
          <FaBox size={30} className="logo-icon" />
          <span className="logo-text">SeeMee</span>
        </Link>
      </div>
      <div className="navbar-location">
        <FaMapMarkerAlt size={20} className="location-icon" />
        <span className="location-text">
          {location || "Fetching location..."}
        </span>
      </div>

      {/* Right Navigation Items */}
      <div className="navbar-right">
        <Link to="/cart" className="icon-link">
          <FaShoppingCart size={30} />
        </Link>
        <Link to="/login" className="icon-link">
          <FaUserCircle size={30} />
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
