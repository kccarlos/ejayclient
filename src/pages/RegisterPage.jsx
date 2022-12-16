import axios from "axios";
import React, { Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Alert from "@mui/material/Alert";
import CheckIcon from "@mui/icons-material/Check";
import { BACKEND_ADDR } from "./const";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const [showRemote, setShowErrorRemote] = useState(false);

  const handleCloseRemote = () => setShowErrorRemote(false);
  const handleShowRemote = () => setShowErrorRemote(true);

  const [showSuccess, setShowSuccess] = useState(false);

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    navigate("/pending", {
      state: {
        username: formData.username,
      },
    });
  };
  const handleShowSuccess = () => setShowSuccess(true);

  const [showInput, setShowInputError] = useState("");
  const [showRemoteError, setShowRemoteError] = useState("");

  const handleClearInput = () => setShowInputError("");
  // const handleShowInput = () => setShowErrorInput(true);

  const navigate = useNavigate();

  let { username, email, password, password2, firstname, lastname, phone } =
    formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const onChangeEmail = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.replace(/[^a-zA-Z0-9.\s]/g, ""),
    });
  };
  const onChangeUsername = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.replace(/[^a-zA-Z0-9\s]/g, ""),
    });
  };

  const onSubmit = async (e) => {
    const form = document.querySelector(".needs-validation");

    e.preventDefault();
    if (!form.checkValidity()) {
      // e.preventDefault()
      e.stopPropagation();
      form.classList.add("was-validated");
      return;
    }

    if (password !== password2) {
      document.getElementById("pwd2").classList.add("is-invalid");
      console.error("Passwords do not match");
    } else {
      // if (!validator.isEmail(email)) {
      //     console.log("invalid email "+ email)
      //     document.getElementById("emailInput").classList.add('is-invalid');
      // } else
      {
        let newUser = {
          username,
          email,
          password,
          password2,
        };

        try {
          const config = {
            headers: {
              "Content-Type": "application/json",
            },
          };
          newUser.email = newUser.email + "@jhu.edu";

          const body = JSON.stringify(newUser);
          const res = await axios.post(
            `${BACKEND_ADDR}/api/users`,
            body,
            config
          );

          if (res.status == 200) {
            handleShowSuccess();
            form.classList.add("was-validated");

            const res = await axios.post(
              `${BACKEND_ADDR}/api/sendVerification`,
              body,
              config
            );
          } else {
            // window.alert(res.body);
            setShowRemoteError(res.body);
            handleShowRemote();
            // setShowErrorInput(res.body)
            console.log("test");
          }
        } catch (err) {
          // document.getElementById("submissionMsgDiv").classList.add('is-invalid');
          // window.alert(err.response.data);
          setShowInputError(err.response.data);
          document
            .getElementById("inputVerification")
            .classList.add("is-invalid");
          console.log("test2");
          console.error(err);
        }
      }
    }
  };

  return (
    <section>
      <Fragment>
        <div className="container-md">
          <div className="h3 mb-3 fw-normal">Sign Up</div>
          <p></p>
          <form className="needs-validation" onSubmit={(e) => onSubmit(e)}>
            <div className="mb-3 align-items-center">
              <div
                className="input-group has-validation"
                id="emailInput"
                aria-describedby="valEmail"
              >
                <input
                  className="form-control"
                  type="text"
                  placeholder="Email"
                  name="email"
                  value={email}
                  onChange={onChangeEmail}
                  maxLength={20}
                  minLength="4"
                  required
                />
                {/*Front-end limit the hostname of email the back-end or form submission function should add email for verification*/}
                <span className="input-group-text" id="basic-addon2">
                  @jhu.edu
                </span>
              </div>
              <div id="emailHelp" className="form-text">
                Please input your JHED
              </div>
              <div className="invalid-feedback" id="valEmail">
                Please enter a valid email.
              </div>
            </div>
            <div className="mb-4">
              <input
                className="form-control"
                type="text"
                placeholder="Username"
                name="username"
                value={username}
                onChange={onChangeUsername}
                maxLength={30}
                minLength="4"
                required
              />
              <div className="invalid-feedback">
                Please enter a valid username.
              </div>
            </div>
            <div className="mb-4 ">
              <input
                className="form-control"
                id="pwd1"
                type="password"
                placeholder="Password"
                name="password"
                value={password}
                onChange={onChange}
                maxLength={20}
                minLength="8"
                aria-describedby="valPwdFd"
                required
              />

              <div id="passwordHelpBlock" className="form-text">
                Your password must be 8-20 characters long, contain letters and
                numbers, and must not contain spaces, special characters, or
                emoji.
              </div>

              <div className="invalid-feedback">
                Please enter a valid password.
              </div>
            </div>
            <div className="mb-4">
              <input
                className="form-control"
                type="password"
                id="pwd2"
                placeholder="Confirm Password"
                name="password2"
                value={password2}
                onChange={onChange}
                maxLength={20}
                minLength="8"
                aria-describedby="valPwdFd"
                required
              />
              <div className="invalid-feedback" id="valPwdFd">
                <Alert variant="outlined" severity="error">
                  Password does not match
                </Alert>
              </div>
            </div>
            <div className="mb-4">
              <div
                id="inputVerification"
                aria-describedby="inputVerificationMsg successMsg"
              ></div>

              <div id="inputVerificationMsg" className="invalid-feedback">
                <Alert variant="outlined" severity="error">
                  {showInput}
                </Alert>
              </div>
            </div>
            <input
              type="submit"
              className="text-center btn btn-outline-dark"
              value="Register"
            />
          </form>
          <p className="my-1">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </Fragment>

      <Modal show={showSuccess} onHide={handleCloseSuccess}>
        <Modal.Header closeButton>
          <Modal.Title>Congra!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
              You account is created successfully!
            </Alert>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => {
              handleCloseSuccess();
              console.log("OK register");
            }}
          >
            Ok
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showRemote} onHide={handleCloseRemote}>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>QwQ! Error Code: {showRemoteError}</p>
          <p>Please try again later!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseRemote}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
};

export default RegisterPage;
