import React, { Fragment, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { deleteLocalStorage } from "../utils/localStorage";
import { Button } from "@mui/material";
import { BACKEND_ADDR } from "./const";
import Modal from "react-bootstrap/Modal";

const PendingPage = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    setShowSuccess(false);
    setShowError(false);
  };
  const { state } = useLocation();
  const handleResend = async () => {
    try {
      const { username } = state;
      const userInfo = { username };
      const response = await fetch(`${BACKEND_ADDR}/api/sendVerification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userInfo),
      });
      console.log(response.body);
      if (!response.ok) {
        setShowError(true);
        setErrorMessage(response.body);
      } else {
        setShowSuccess(true);
      }
    } catch(err) {
      setShowError(true);
      setErrorMessage("Please go to login page and try again.");
    }

  };

  return (
    <section className="container">
      <div className="">
        <p className="text-center">
          We've sent a verification link to your email address. Please check
          your email before you can login.
        </p>
        <p className="text-center">
          Didn't receive verification email? Check your spam or click{" "}
          <Button onClick={handleResend}>Resend</Button> to request a new link.
        </p>
      </div>
      <Modal show={showSuccess} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Verification Sent!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            An email with verification link has been sent to your email address.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showError} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Failed to send email. {errorMessage}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
};

export default PendingPage;
