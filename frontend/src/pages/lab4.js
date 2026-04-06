import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Lab4 = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [status, setStatus] = useState(null);
  const [stats, setStats] = useState(null);

  const apiBase = "http://127.0.0.1:8000/api/v1/lab4";

  const generateKeys = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${apiBase}/generate-keys`);
      const { private_key, public_key } = response.data;

      setPrivateKey("");
      setPublicKey("");

      const downloadKey = (content, fileName) => {
        const blob = new Blob([content], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      };

      downloadKey(public_key, "public_key.pem");
      downloadKey(private_key, "private_key.pem");

      setStatus({
        success: true,
        message: "Ключі RSA-2048 згенеровано та збережено на пристрій!",
      });
    } catch (error) {
      alert("Помилка при генерації ключів");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (endpoint) => {
    if (!file) return alert("Виберіть файл!");
    if (endpoint === "encrypt-file" && !publicKey)
      return alert("Потрібен публічний ключ!");
    if (endpoint === "decrypt-file" && !privateKey)
      return alert("Потрібен приватний ключ!");

    setLoading(true);
    setStatus(null);
    setStats(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      endpoint === "encrypt-file" ? "public_key" : "private_key",
      endpoint === "encrypt-file" ? publicKey : privateKey,
    );

    try {
      const response = await axios.post(`${apiBase}/${endpoint}`, formData, {
        responseType: endpoint === "encrypt-file" ? "json" : "arraybuffer",
      });

      if (endpoint === "encrypt-file") {
        setStats({
          rsa: response.data.rsa_time_sec,
          rc5: response.data.rc5_time_sec,
          total: response.data.total_time,
        });

        const hexString = response.data.encrypted_data_base64;
        const bytes = new Uint8Array(
          hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)),
        );
        downloadFile(bytes, `${file.name}.rsa`);
      } else {
        downloadFile(
          response.data,
          `decrypted_${file.name.replace(".rsa", "")}`,
        );
      }

      setStatus({
        success: true,
        message: `Файл успішно ${endpoint === "encrypt-file" ? "зашифровано" : "розшифровано"}!`,
      });
    } catch (error) {
      console.error(error);
      setStatus({
        success: false,
        message: "Помилка. Перевірте валідність ключів.",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (data, fileName) => {
    const blob = new Blob([data], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
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
          RSA Hybrid Cryptosystem Panel
        </h1>
      </header>

      <div
        style={{
          padding: "30px 20px",
          maxWidth: "1000px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ color: "#3d5690", marginTop: 0, fontSize: "16px" }}>
            RSA Key Management
          </h3>
          <p style={{ fontSize: "12px", color: "#666" }}>
            Генеруйте ключі та завантажуйте їх з комп'ютера для роботи:
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
              marginBottom: "15px",
            }}
          >
            <div>
              <label style={{ fontSize: "12px", fontWeight: "bold" }}>
                Public Key File:
              </label>
              <input
                type="file"
                onChange={(e) => {
                  const reader = new FileReader();
                  reader.onload = (el) => setPublicKey(el.target.result);
                  reader.readAsText(e.target.files[0]);
                }}
                style={{ width: "100%", marginTop: "5px" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "bold" }}>
                Private Key File:
              </label>
              <input
                type="file"
                onChange={(e) => {
                  const reader = new FileReader();
                  reader.onload = (el) => setPrivateKey(el.target.result);
                  reader.readAsText(e.target.files[0]);
                }}
                style={{ width: "100%", marginTop: "5px" }}
              />
            </div>
          </div>

          <button
            onClick={generateKeys}
            style={getBtnStyle("gen", "#5c6bc0")}
            onMouseEnter={() => setHoveredBtn("gen")}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            {loading ? "Generating..." : "Generate & Download Keys (.pem)"}
          </button>
        </div>
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
            <h3 style={{ color: "#3d5690", marginTop: 0, fontSize: "16px" }}>
              Select File:
            </h3>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ fontSize: "13px", width: "100%" }}
            />
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "20px",
              borderRadius: "15px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1 }}>
              <button
                onClick={() => handleAction("encrypt-file")}
                disabled={loading}
                style={getBtnStyle("enc", "#3d5690")}
                onMouseEnter={() => setHoveredBtn("enc")}
                onMouseLeave={() => setHoveredBtn(null)}
              >
                Encrypt
              </button>
            </div>
            <div style={{ flex: 1 }}>
              <button
                onClick={() => handleAction("decrypt-file")}
                disabled={loading}
                style={getBtnStyle("dec", "#2e7d32")}
                onMouseEnter={() => setHoveredBtn("dec")}
                onMouseLeave={() => setHoveredBtn(null)}
              >
                Decrypt
              </button>
            </div>
          </div>
        </div>
        {stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                background: "#e8eaf6",
                padding: "15px",
                borderRadius: "10px",
                textAlign: "center",
                border: "1px solid #3d5690",
              }}
            >
              <div style={{ fontSize: "12px", color: "#3d5690" }}>
                RSA Time (Key)
              </div>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                {stats.rsa}s
              </div>
            </div>
            <div
              style={{
                background: "#e8f5e9",
                padding: "15px",
                borderRadius: "10px",
                textAlign: "center",
                border: "1px solid #2e7d32",
              }}
            >
              <div style={{ fontSize: "12px", color: "#2e7d32" }}>
                RC5 Time (Data)
              </div>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                {stats.rc5}s
              </div>
            </div>
            <div
              style={{
                background: "#fff3e0",
                padding: "15px",
                borderRadius: "10px",
                textAlign: "center",
                border: "1px solid #ef6c00",
              }}
            >
              <div style={{ fontSize: "12px", color: "#ef6c00" }}>
                Total Hybrid Time
              </div>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                {stats.total}s
              </div>
            </div>
          </div>
        )}

        {status && (
          <div
            style={{
              marginTop: "20px",
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
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
            textAlign: "center",
            fontSize: "12px",
            color: "#666",
          }}
        >
          <div
            style={{ background: "#eee", padding: "10px", borderRadius: "8px" }}
          >
            <b>Mode:</b> RSA-2048 OAEP + RC5 Hybrid
          </div>
          <div
            style={{ background: "#eee", padding: "10px", borderRadius: "8px" }}
          >
            <b>Padding:</b> PKCS7 & OAEP SHA-256
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lab4;
