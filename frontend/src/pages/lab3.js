import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Lab3 = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [status, setStatus] = useState(null);

  const apiBase = "http://127.0.0.1:8000/api/v1/lab3";

  const handleAction = async (endpoint) => {
    if (!file || !password) return alert("Виберіть файл та введіть пароль!");

    setLoading(true);
    setStatus(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);

    try {
      const response = await axios.post(`${apiBase}/${endpoint}`, formData, {
        responseType: "arraybuffer",
      });

      const blob = new Blob([response.data], {
        type: "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const fileName =
        endpoint === "encrypt"
          ? `${file.name}.enc`
          : `decrypted_${file.name.replace(".enc", "")}`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      link.remove();

      setStatus({
        success: true,
        message: `Файл успішно ${endpoint === "encrypt" ? "зашифровано" : "розшифровано"}!`,
      });
    } catch (error) {
      setStatus({
        success: false,
        message: "Помилка виконання. Перевірте пароль.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBtnStyle = (id, baseColor = "#3d5690") => ({
    width: "100%",
    padding: "14px",
    fontSize: "15px",
    backgroundColor: baseColor,
    color: hoveredBtn === id ? "#eaf3b2" : "#ffffff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: "bold",
    marginTop: "10px",
    opacity: loading ? 0.7 : 1,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f4f7f9",
        fontFamily: "Segoe UI, Arial, sans-serif",
      }}
    >
      <header
        style={{
          width: "100%",
          backgroundColor: "#3d5690",
          padding: "15px 0",
          textAlign: "center",
          color: "#ffffff",
          position: "relative",
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            position: "absolute",
            left: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "transparent",
            color: "white",
            border: "1px solid white",
            borderRadius: "5px",
            padding: "5px 12px",
            cursor: "pointer",
          }}
        >
          ← Назад
        </button>
        <h1 style={{ margin: 0, fontSize: "20px" }}>
          RC5 Confidentiality Control Panel
        </h1>
      </header>

      <div
        style={{
          padding: "30px 20px",
          maxWidth: "900px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "20px",
              borderRadius: "15px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <h3
              style={{
                color: "#3d5690",
                marginTop: 0,
                fontSize: "16px",
                marginBottom: "15px",
              }}
            >
              Encryption Password (MD5 Key):
            </h3>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "2px solid #e1e8ed",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "20px",
              borderRadius: "15px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <h3
              style={{
                color: "#3d5690",
                marginTop: 0,
                fontSize: "16px",
                marginBottom: "15px",
              }}
            >
              Target File:
            </h3>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ fontSize: "13px", width: "100%" }}
            />
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <button
            onMouseEnter={() => setHoveredBtn("enc")}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={() => handleAction("encrypt")}
            disabled={loading}
            style={getBtnStyle("enc")}
          >
            {loading ? "Processing..." : "Encrypt & Download"}
          </button>
          <button
            onMouseEnter={() => setHoveredBtn("dec")}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={() => handleAction("decrypt")}
            disabled={loading}
            style={getBtnStyle("dec", "#2e7d32")}
          >
            {loading ? "Processing..." : "Decrypt & Download"}
          </button>
        </div>

        {status && (
          <div
            style={{
              marginTop: "30px",
              backgroundColor: "#ffffff",
              padding: "20px",
              borderRadius: "20px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              borderLeft: `10px solid ${status.success ? "#2e7d32" : "#d9534f"}`,
              textAlign: "center",
            }}
          >
            <b
              style={{
                fontSize: "18px",
                color: status.success ? "#2e7d32" : "#d9534f",
              }}
            >
              {status.message}
            </b>
          </div>
        )}

        <div
          style={{
            marginTop: "20px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
            textAlign: "center",
            fontSize: "12px",
            color: "#666",
          }}
        >
          <div
            style={{ background: "#eee", padding: "10px", borderRadius: "8px" }}
          >
            <b>Algorithm:</b> RC5-32/8/8
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lab3;
