import axios from "axios";
import React, {useState} from "react";
import {useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";
import {setLocalStorage} from "../utils/localStorage";

import Alert from '@mui/material/Alert';
import { BACKEND_ADDR } from "./const";

const LoginPage = (props) => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    const {username, password} = formData;

    const onChange = (e) =>
        setFormData({...formData, [e.target.name]: e.target.value});

    const onSubmit = async (e) => {
        const form = document.querySelector(".needs-validation");

        e.preventDefault();
        if (!form.checkValidity()) {
            e.stopPropagation()
            form.classList.add('was-validated')
            return
        }
        const user = {
            username,
            password,
        };
        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                },
            };

            const body = JSON.stringify(user);
            const res = await axios.post(
                `${BACKEND_ADDR}/api/auth`,
                body,
                config
            );

            if (res.status === 200) {
                props.onToken(res.data.token);
                setLocalStorage('token', res.data.token);
                setIsLoggedIn(true);
                form.classList.add('was-validated');
            } else {
                //NOTE: should not reach here
                window.alert(res.body);
            }
        } catch (err) {
            // password incorrect
            console.log(err);
            if (err.response.status == 401) {
                setIsActive(false);
                console.log(isActive);
            }
            setErrorMessage(err.response.data)
            document.querySelector("#formPlaceholder").classList.add('is-invalid');
            document.querySelector("#formUserName").classList.add('is-invalid');
            document.querySelector("#formPassword").classList.add('is-invalid');

            e.stopPropagation();
            // window.alert(err.response.data);
        }
        console.log("test");
    };

    // const jhuLogin = async (e) => {
    //     console.log("click on jhu login");
    //     const res = await axios.get(
    //         BACKEND_ADDR + "/jhu/login",
    //     );
    //     console.log(res);
    // };

    useEffect(() => {
        if (isActive && isLoggedIn) {
            navigate("/");
        } else if (!isActive) {
            navigate("/pending", {state: {username: formData.username}});
        }
    }, [isActive, isLoggedIn]);

    return (
        <section className="container-md col-8">
            <div><h1>Log In</h1></div>
            <form className="needs-validation" onSubmit={e => onSubmit(e)}>
                <div className="align-items-center">

                    <div className="mb-3 ">
                        <input className="form-control"
                               id="formUserName"
                               aria-describedby="invalidPwdOrUsername"
                               type="text"
                               placeholder="Username or Email"
                               name="username"
                               value={username}
                               onChange={onChange}
                               maxLength={200}
                               minLength="5"
                               required/>
                        {/* <div id="emailHelp" className="form-text">We'll never share your email with anyone
                            else.
                        </div> */}
                        {/*<div className="invalid-feedback" id="invalidPwdOrUsername">*/}
                        {/*    Please enter user name or email*/}
                        {/*</div>*/}
                    </div>
                    <div className="mb-3">
                        <input
                            className="form-control"
                            id="formPassword"
                            aria-describedby="invalidPwd"
                            type="password"
                            placeholder="Password"
                            name="password"
                            value={password}
                            maxLength={20}
                            onChange={onChange}
                            required
                            />
                        {/*<div className="invalid-feedback">*/}
                        {/*    <Alert variant="outlined" severity="error">*/}
                        {/*        Enter Password!*/}
                        {/*    </Alert>*/}
                        {/*</div>*/}
                    </div>
                </div>
                <div className="" aria-describedby="invalidPwdOrUsername" id="formPlaceholder"></div>

                <div className="invalid-feedback" style={{marginBottom: 10}} id="invalidPwdOrUsername">
                    <Alert variant="outlined" severity="error">
                        {/*User does not exists or password wrong!*/}
                        {errorMessage}
                    </Alert>
                    {/*<h4>User does not exists or password wrong!</h4>*/}
                </div>
                <div>
                    <button className="text-center btn btn-outline-dark " onClick={onSubmit}
                            to="/">Login
                    </button>
                </div>
                {/* <div>
                    <button className="text-center btn btn-outline-dark " onClick={jhuLogin}
                            to="/">JHU SSO Login
                    </button>
                </div> */}
            </form>
            <p className="">
                Don't have an account? <Link to="/register">Sign Up</Link>
            </p>
            <div></div>
        </section>
    )
};

export default LoginPage;