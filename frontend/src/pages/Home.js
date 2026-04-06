import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const labs = [1, 2, 3, 4, 5];

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    margin: 0,
    padding: 0,
    fontFamily: "Arial, sans-serif",
  };

  const headerStyle = {
    width: "100%",
    backgroundColor: "#3d5690",
    padding: "20px 0",
    textAlign: "center",
    color: "#ffffff",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  };

  const buttonGridStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginTop: "60px",
  };

  const getButtonStyle = (id) => ({
    padding: "18px 45px",
    fontSize: "18px",
    backgroundColor: "#ffffff",
    color: hoveredBtn === id ? "#8ab1c7" : "#333333",
    border: `4px solid #eaf3b2`,
    borderRadius: "15px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    width: "320px",
    fontWeight: "bold",
    outline: "none",
  });

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: "24px" }}>Лабораторні роботи</h1>
      </header>

      <div style={buttonGridStyle}>
        {labs.map((num) => (
          <button
            key={num}
            style={getButtonStyle(num)}
            onMouseEnter={() => setHoveredBtn(num)}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={() => {
              if (num === 1) navigate("/lab1");
              else if (num === 2) navigate("/lab2");
              else if (num == 3) navigate("/lab3");
              else if (num == 4) navigate("/lab4");
              else if (num == 5) navigate("/lab5");
              else alert("Ця робота ще не додана");
            }}
          >
            Лабораторна робота №{num}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;
