import React from "react";
import "../App.css";
function HomeScreen({ services }) {
  console.log("Services from HomeScreen Page", services);
  return (
    <div className="main">
      <section>Home</section>
      <h1>Welcome to GoLaundry</h1>
      <p>Where you can makes ypur comfort through dress styling</p>
      <span>
        Thank's for seeing us, Here we can make you more comfortable with our
        services
      </span>
      <div className="services-list">
        {services.length > 0 && services?.map((service) => (
          <div>
            <span>{service.laundry.ironService.serviceName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomeScreen;
