import React, { useState, useEffect } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { FaExclamationCircle, FaCheckCircle } from "react-icons/fa";

// Global variables to store the toast state
let showToastGlobal = false;
let toastMessageGlobal = "";
let toastTypeGlobal = "error";
let setShowToastGlobal = null;
let setToastMessageGlobal = null;
let setToastTypeGlobal = null;

// Function to show toast message from anywhere in the app
export const showToast = (message, type = "error") => {
  if (setShowToastGlobal && setToastMessageGlobal && setToastTypeGlobal) {
    setToastMessageGlobal(message);
    setToastTypeGlobal(type);
    setShowToastGlobal(true);
  } else {
    // Fallback to alert if the toast component is not mounted
    alert(message); // You can comment this line out if you want to avoid alerts
  }
};

const SimpleToast = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("error");

  useEffect(() => {
    // Store the setState functions in global variables
    setShowToastGlobal = setShowToast;
    setToastMessageGlobal = setToastMessage;
    setToastTypeGlobal = setToastType;

    return () => {
      // Clean up global variables when component unmounts
      setShowToastGlobal = null;
      setToastMessageGlobal = null;
      setToastTypeGlobal = null;
    };
  }, []);

  const isSuccess = toastType === "success";

  return (
    <ToastContainer position="top-end" className="p-3">
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={3000}
        autohide
        className="drop-in-toast"
      >
        <Toast.Body
          className={`d-flex align-items-center ${
            isSuccess ? "text-success" : "text-danger"
          }`}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "10px",
          }}
        >
          {isSuccess ? (
            <FaCheckCircle className="me-1" style={{ fontSize: "2rem" }} />
          ) : (
            <FaExclamationCircle
              className="me-1"
              style={{ fontSize: "2rem" }}
            />
          )}
          {toastMessage}
        </Toast.Body>
      </Toast>

      <style>
        {`
        @keyframes drop-in {
          0% { transform: translateY(-100%); } 
          100% { transform: translateY(0); } 
        }
        .drop-in-toast {
          animation: drop-in 0.5s forwards;
          min-height: 60px; /* Default height */
        }
  
        /* Reduce height for mobile screens */
        @media (max-width: 576px) {
          .drop-in-toast {
            min-height: 45px; /* Smaller height on mobile */
          }
          .drop-in-toast .toast-body {
            font-size: 0.9rem; /* Slightly smaller text */
          }
          .drop-in-toast svg {
            font-size: 1.5rem; /* Smaller icons */
          }
        }
      `}
      </style>
    </ToastContainer>
  );
};

export default SimpleToast;
