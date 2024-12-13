import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import "./css/Ironing.css";
import { FaCalendarAlt } from "react-icons/fa";

const Ironing = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Replace with your API endpoint
    fetch("http://localhost:8080/vendors/vendorsList/janapriyaNagar")
      .then((response) => response.json())
      .then((data) => {
        setVendors(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching vendors:", error);
        setLoading(false);
      });
  }, []);

  const handleSchedulePickup = (vendorId) => {
    navigate(`/schedule-pickup/${vendorId}`); // Add this function
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="vendor-grid">
      {vendors.map((vendor) => (
        <div key={vendor.vendorId} className="vendor-card">
          <h2 style={{ textAlign: "center " }}>{vendor.vendorShopName}</h2>
          <h4>{vendor.vendorName}</h4>
          <div className="vendor-contact-details">
            <h3>Contact Details</h3>
            {vendor.vendorContactDetails.map((contact, index) => (
              <div key={index}>
                <p>Phone: {contact.phone}</p>
                <p>Email: {contact.email}</p>
              </div>
            ))}
          </div>
          <div className="vendor-services">
            <h3>Services</h3>
            {vendor.vendorServices.map((service, index) => (
              <div key={index}>
                <p>Service Name: {service.serviceName}</p>
                <p>Description: {service.serviceDescription}</p>
                <p>Price: {service.servicePrice}</p>
                <p>Duration: {service.serviceDuration}</p>
                <button
                  className="selection-button"
                  onClick={() => handleSchedulePickup(vendor.vendorId)} // Modify this line
                >
                  Schedule Pickup <FaCalendarAlt className="icon" />
                </button>
              </div>
            ))}
          </div>
          <div className="vendor-reviews">
            <h4>Reviews</h4>
            {vendor.vendorReviews.map((review, index) => (
              <div key={index}>
                <p>
                  <StarRating rating={review.reviewerRating} />
                </p>
              </div>
            ))}
            <p>Total Ratings: {vendor.vendorReviews.length}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const StarRating = ({ rating }) => {
  const totalStars = 5;
  const filledStars = Math.round(rating);
  const emptyStars = totalStars - filledStars;

  return (
    <div className="star-rating">
      {Array(filledStars).fill(<span className="star filled">★</span>)}
      {Array(emptyStars).fill(<span className="star empty">☆</span>)}
    </div>
  );
};

export default Ironing;
