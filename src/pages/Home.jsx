import React, { useState, useEffect } from "react";
import "./css/Home.css";
import { Link } from "react-router-dom";

const bannerImages = [
  "https://services4sure.in/wp-content/uploads/2018/08/washing-machine-banner.jpg",
];

const servicesData = {
  services: ["WASH & IRON", "WASH & FOLD", "DRY CLEANING", "IRONING"],
};

function Home() {
  const [currentImage, setCurrentImage] = useState(0);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentImage((prevImage) => (prevImage + 1) % bannerImages.length);
  //   }, 10000); // Changes image every 5 seconds
  //   return () => clearInterval(interval); // Cleanup on component unmount
  // }, []);

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
        <img src={bannerImages[0]} alt={`Banner ${currentImage + 1}`} />
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
      <div>
        <header>Our Services</header>
        <strong>
          Laundry services provide convenient solutions for individuals,
          businesses, and organizations to clean and maintain garments and
          textiles. These services range from basic washing and drying to more
          specialized offerings, such as stain removal, dry cleaning, and
          ironing. The key goal is to save time, effort, and resources for
          customers while ensuring clothes are well cared for.
        </strong>
      </div>
    </div>
  );
}

export default Home;
