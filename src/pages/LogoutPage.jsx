import React, {Fragment, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {deleteLocalStorage} from "../utils/localStorage";

const LogoutPage = (props) => {
    const navigate = useNavigate();
    localStorage.clear();
    props.onToken("");
    deleteLocalStorage('token')
    setTimeout(() => {
      navigate("/");
    }, 1000);

    return (
        <section className="container">
            <div className="">
                <p className="text-center">
                Successfully signed out! Redirecting to homepage...
            </p>
                <p className="text-center">
                    or click <Link to="/">here</Link> to manually return to homepage
                </p>
            </div>

        </section>
    );
};

export default LogoutPage;
