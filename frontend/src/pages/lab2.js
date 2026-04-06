import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Lab2 = () => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [targetFile, setTargetFile] = useState(null);
  const [hashFile, setHashFile] = useState(null);
  const [results, setResults] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const apiBase = "http://127.0.0.1:8000/api/v1/lab2";

  const saveToFile = (content, filename) => {
    const element = document.createElement("a");
    const fileBlob = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(fileBlob);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
  };

  const handleAction = async (type) => {
    try {
      if (type === "string") {
        if (!text) return alert("Введіть текст!");
        const formData = new FormData();
        formData.append("text", text);
        const res = await axios.post(`${apiBase}/hash/string`, formData);
        setResults({ type: "text", hash: res.data.hash, input: text });
      } else if (type === "file") {
        if (!file) return alert("Виберіть файл!");
        const formData = new FormData();
        formData.append("file", file);
        const res = await axios.post(`${apiBase}/hash/file`, formData);
        setResults({ type: "file", hash: res.data.hash, filename: file.name });
      } else if (type === "verify") {
        if (!targetFile || !hashFile) return alert("Виберіть обидва файли!");
        const formData = new FormData();
        formData.append("target_file", targetFile);
        formData.append("hash_file", hashFile);
        const res = await axios.post(`${apiBase}/verify`, formData);
        setResults({ type: "verify", ...res.data });
      }
    } catch (e) {
      alert("Помилка виконання запиту.");
    }
  };

  const getBtnStyle = (id) => ({
    width: "100%",
    padding: "14px",
    fontSize: "15px",
    backgroundColor: "#3d5690",
    color: hoveredBtn === id ? "#eaf3b2" : "#ffffff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: "bold",
    marginTop: "10px",
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
          MD5 Integrity Control Panel
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
              display: "flex",
              flexDirection: "column",
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
              Hash Text String:
            </h3>
            <div style={{ height: "60px" }}>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text..."
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "2px solid #e1e8ed",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <button
              onMouseEnter={() => setHoveredBtn("gen_str")}
              onMouseLeave={() => setHoveredBtn(null)}
              onClick={() => handleAction("string")}
              style={getBtnStyle("gen_str")}
            >
              Generate Hash
            </button>
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "20px",
              borderRadius: "15px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
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
              Hash File:
            </h3>
            <div
              style={{ height: "60px", display: "flex", alignItems: "center" }}
            >
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ fontSize: "13px", width: "100%" }}
              />
            </div>
            <button
              onMouseEnter={() => setHoveredBtn("gen_file")}
              onMouseLeave={() => setHoveredBtn(null)}
              onClick={() => handleAction("file")}
              style={getBtnStyle("gen_file")}
            >
              Hash Uploaded File
            </button>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            marginBottom: "30px",
          }}
        >
          <h2
            style={{
              color: "#3d5690",
              marginTop: 0,
              marginBottom: "20px",
              fontSize: "18px",
              borderLeft: "4px solid #3d5690",
              paddingLeft: "12px",
            }}
          >
            Integrity Verification:
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "6px",
                  color: "#555",
                  fontSize: "12px",
                }}
              >
                Target File:
              </label>
              <input
                type="file"
                onChange={(e) => setTargetFile(e.target.files[0])}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "6px",
                  color: "#555",
                  fontSize: "12px",
                }}
              >
                Checksum File (.txt):
              </label>
              <input
                type="file"
                onChange={(e) => setHashFile(e.target.files[0])}
                style={{ width: "100%" }}
              />
            </div>
          </div>
          <button
            onMouseEnter={() => setHoveredBtn("verify")}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={() => handleAction("verify")}
            style={{ ...getBtnStyle("verify"), marginTop: "20px" }}
          >
            Run Integrity Test
          </button>
        </div>

        {results && (
          <div
            style={{
              marginTop: "30px",
              backgroundColor: "#ffffff",
              padding: "30px",
              borderRadius: "20px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              borderLeft: "10px solid #3d5690",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "25px",
              }}
            >
              <h2 style={{ color: "#3d5690", margin: 0, fontSize: "20px" }}>
                Execution Results:
              </h2>
              <button
                onClick={() => setResults(null)}
                style={{
                  background: "#fdf2f2",
                  border: "1px solid #f8d7da",
                  color: "#d9534f",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ✕ Clear
              </button>
            </div>

            <div
              style={{
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "12px",
                border: "1px solid #e9ecef",
              }}
            >
              {results.type === "verify" ? (
                <div style={{ textAlign: "center" }}>
                  <b
                    style={{
                      fontSize: "22px",
                      color: results.valid ? "#2e7d32" : "#d9534f",
                    }}
                  >
                    {results.valid
                      ? "Integrity Confirmed!"
                      : "Integrity Violated"}
                  </b>
                  <div
                    style={{
                      marginTop: "15px",
                      textAlign: "left",
                      fontSize: "14px",
                      fontFamily: "monospace",
                    }}
                  >
                    <div style={{ marginBottom: "5px" }}>
                      <b>Calculated:</b> {results.actual_hash}
                    </div>
                    <div>
                      <b>Expected:</b> {results.expected_hash}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      saveToFile(
                        `Result: ${results.valid ? "VALID" : "INVALID"}\nActual: ${results.actual_hash}\nExpected: ${results.expected_hash}`,
                        "integrity_report.txt",
                      )
                    }
                    style={{
                      marginTop: "15px",
                      padding: "10px 20px",
                      cursor: "pointer",
                      borderRadius: "8px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      fontWeight: "bold",
                    }}
                  >
                    Save Report to .txt
                  </button>
                </div>
              ) : (
                <div>
                  <span
                    style={{
                      display: "block",
                      fontWeight: "bold",
                      color: "#3d5690",
                      marginBottom: "10px",
                    }}
                  >
                    Calculated MD5 Hash:
                  </span>
                  <code
                    style={{
                      wordBreak: "break-all",
                      fontSize: "16px",
                      color: "#333",
                      backgroundColor: "#eee",
                      padding: "5px",
                      borderRadius: "5px",
                    }}
                  >
                    {results.hash}
                  </code>
                  <div style={{ marginTop: "15px" }}>
                    <button
                      onClick={() =>
                        saveToFile(results.hash, "hash_result.txt")
                      }
                      style={{
                        padding: "10px 20px",
                        cursor: "pointer",
                        borderRadius: "8px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        fontWeight: "bold",
                      }}
                    >
                      Save Hash to .txt
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lab2;
