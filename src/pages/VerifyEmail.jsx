import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteLocalStorage } from "../utils/localStorage";
import { BACKEND_ADDR } from "./const";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("Verifying your email...");

  localStorage.clear();
  deleteLocalStorage("token");

  const resultMessage = useMemo(() => {
    return <p className="text-center">{message}</p>;
  }, [message]);

  const verify = async () => {
    if (verified) {
      return;
    }
    const response = await fetch(
      `${BACKEND_ADDR}/api/verifyEmail/${params.id}`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      if (response.status === 401) {
        setMessage("Email verification failed. Invalid verification link");
      } else if (response.status === 500) {
        setMessage("Email verification failed. Server error");
      } else {
        setMessage("Email verification failed. Unknown error");
      }
    } else {
      const msg = `Email verification succeeded. 
      You can now login. Welcome to eJay!`;
      setMessage(msg);
      setVerified(true);
    }
  };

  let i = 0;
  useEffect(() => {
    verify();
    console.log(++i);
  }, []);

  return (
    <section className="container">
      <div className="">{resultMessage}</div>
    </section>
  );
};

export default VerifyEmail;
