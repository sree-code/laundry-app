import React, { useState, useEffect } from "react";
import "./css/Home.css";
import { Link } from "react-router-dom";

const bannerImages = [
  "https://via.placeholder.com/1200x300?text=IronBox+Service+2",
  "https://via.placeholder.com/1200x300?text=IronBox+Service+3",
  "https://via.placeholder.com/1200x300?text=IronBox+Service+4",
  "https://via.placeholder.com/1200x300?text=IronBox+Service+5",
];

const servicesData = {
  services: ["WASH & IRON", "WASH & FOLD", "DRY CLEANING", "IRONING"],
};

function Home() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % bannerImages.length);
    }, 5000); // Changes image every 5 seconds
    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  const serviceRoutes = {
    "WASH & IRON": "/wash-iron",
    "WASH & FOLD": "/wash-fold",
    "DRY CLEANING": "/dry-cleaning",
    IRONING: "/ironing",
  };

  return (
    <div className="home-container">
      {/* Scrolling Banner */}
      <div className="scrolling-banner">
        <img
          src={bannerImages[currentImage]}
          alt={`Banner ${currentImage + 1}`}
        />
      </div>

      <h1 className="home-title">Our Services</h1>
      <div className="services-grid">
        {servicesData.services.map((service, index) => (
          <Link
            to={serviceRoutes[service]}
            key={index}
            className="service-card"
          >
            <div className="service-name">{service}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
