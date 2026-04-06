import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Lab5 = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [signatureHex, setSignatureHex] = useState("");
  const [verifySigInput, setVerifySigInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [status, setStatus] = useState(null);
  const [stats, setStats] = useState(null);

  const apiBase = "http://127.0.0.1:8000/api/v1/lab5";

  const generateKeys = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBase}/keys/generate`);
      const { private_key, public_key } = response.data;

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

      downloadKey(public_key, "dsa_public_key.pem");
      downloadKey(private_key, "dsa_private_key.pem");

      setStatus({
        success: true,
        message: "Ключі DSA-2048 згенеровано та збережено!",
      });
    } catch (error) {
      alert("Помилка при генерації ключів");
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!file || !privateKey)
      return alert("Виберіть файл та завантажте приватний ключ!");
    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("private_key", privateKey);

    try {
      const response = await axios.post(`${apiBase}/sign`, formData);
      setSignatureHex(response.data.signature_hex);
      setStats({ time: response.data.time_sec });

      setStatus({
        success: true,
        message: "Цифровий підпис успішно створено!",
      });
    } catch (error) {
      setStatus({
        success: false,
        message: "Помилка підпису, перевірте ключ!",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!file || !verifySigInput || !publicKey)
      return alert("Заповніть всі поля для перевірки!");
    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("signature_hex", verifySigInput);
    formData.append("public_key", publicKey);

    try {
      const response = await axios.post(`${apiBase}/verify`, formData);
      setStats({ time: response.data.time_sec });
      setStatus({
        success: response.data.is_valid,
        message: response.data.is_valid
          ? "Підпис валідний, цілісність підтверджено!"
          : "Підпис невірний",
      });
    } catch (error) {
      setStatus({ success: false, message: "Помилка верифікації" });
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

  const cardStyle = {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    marginBottom: "20px",
  };

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
          DSA Digital Signature Panel
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
        <div style={cardStyle}>
          <h3 style={{ color: "#3d5690", marginTop: 0, fontSize: "16px" }}>
            DSA Key Management
          </h3>
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
                Public Key (.pem):
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
                Private Key (.pem):
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
            Generate & Download DSA Keys
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.5fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <div style={cardStyle}>
            <h3 style={{ color: "#3d5690", marginTop: 0, fontSize: "16px" }}>
              Select File:
            </h3>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ fontSize: "13px", width: "100%" }}
            />
            <button
              onClick={handleSign}
              style={getBtnStyle("sign")}
              onMouseEnter={() => setHoveredBtn("sign")}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              Create Signature
            </button>
          </div>

          <div style={cardStyle}>
            <h3 style={{ color: "#3d5690", marginTop: 0, fontSize: "16px" }}>
              Signature Result (HEX):
            </h3>
            <textarea
              value={signatureHex}
              readOnly
              style={{
                width: "100%",
                height: "80px",
                fontSize: "10px",
                fontFamily: "monospace",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                backgroundColor: "#f9f9f9",
                resize: "none",
              }}
            />
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ color: "#3d5690", marginTop: 0, fontSize: "16px" }}>
            Integrity Verification
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            <div>
              <label style={{ fontSize: "12px", fontWeight: "bold" }}>
                Paste Signature HEX:
              </label>
              <textarea
                onChange={(e) => setVerifySigInput(e.target.value)}
                style={{
                  width: "100%",
                  height: "20px",
                  fontSize: "10px",
                  marginTop: "5px",
                  borderRadius: "5px",
                  border: "1px solid #ddd",
                }}
              />
            </div>
            <button
              onClick={handleVerify}
              style={getBtnStyle("verify", "#2e7d32")}
              onMouseEnter={() => setHoveredBtn("verify")}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              Verify Integrity
            </button>
          </div>
        </div>

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
            {stats && (
              <div
                style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}
              >
                Execution time: {stats.time.toFixed(6)}s
              </div>
            )}
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
            <b>Algorithm:</b> DSA-2048 (DSS)
          </div>
          <div
            style={{ background: "#eee", padding: "10px", borderRadius: "8px" }}
          >
            <b>Hash:</b> SHA-256
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lab5;
