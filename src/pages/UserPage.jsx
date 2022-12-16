import React, {useState, useEffect} from "react";
import {
    BrowserRouter,
    Route,
    Routes,
    Link, useNavigate,
} from "react-router-dom";
import Modal from 'react-bootstrap/Modal';
import Popup from "reactjs-popup";
import MiniList from "./components/MiniList";
import NewProduct from "./NewProduct";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Button from "react-bootstrap/Button";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import {getLocalStorage} from "../utils/localStorage";
import Rating from '@mui/material/Rating';
import StepCard from "./components/StepCard";
// import ProgressiveImg from "./components/ProgressiveImg.png";

import { BACKEND_ADDR } from "./const";

const token = localStorage.getItem('token');

function TabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{p: 3}}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}


function UserPage(props) {
    const [user, setUser] = useState([]);
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [userID, setUserID] = useState(window.location.pathname.split("/")[2]);
    const [tabNum, setTabNum] = useState(0);
    const [show, setShow] = useState(false);
    const [editing, setEditing] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [showError, setShowError] = useState(false);
    const [errorMsg, setErrorMSg] = useState("");

    const handleErrorClose = () => setShowError(false);
    const handleErrorShow = () => setShowError(true);

    const [showSavePromote, setSavePromote] = useState(false);

    const handleSavePromoteClose = () => setSavePromote(false);
    const handleSavePromoteShow = () => setSavePromote(true);
    // const UserID = TestUseID;
    //FIXME:redirect to the main page if it not loged in
    var jsonData = {
        _id: userID,
    };

    async function fetchUserProfile() {
        const response = await fetch(`${BACKEND_ADDR}/api/auth`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": getLocalStorage('token') ,
            },
            // body: JSON.stringify(jsonData)
        });
        if (!response.ok) {
            if (response.status === 401) {
                navigate("/logout");
                return;
            }
            return;
        }
        const userProfile = await response.json();
        setUser(userProfile);
    }

    async function getUserProducts() {
        const response = await fetch(`${BACKEND_ADDR}/api/userproducts`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": getLocalStorage('token') ,
            },
            // body: JSON.stringify(jsonData)
        });
        if (!response.ok) {
            if (response.status === 401) {
                navigate("/logout");
                return;
            }
            window.alert(`Error: ${response.statusText}`);
            return;
        }

        const userProducts = await response.json();
        setProducts(userProducts);
    }

    const onChange = (e) => {
        setUser({...user, [e.target.name]: e.target.value});
    };

    const sendForm = async (e) => {
        const response = await fetch(`${BACKEND_ADDR}/userProfile`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": getLocalStorage('token') ,
            },
            body: JSON.stringify(user),
        });
        if (!response.ok) {
            if (response.status === 401) {
                navigate("/logout");
                return;
            }
            window.alert(`Error: ${response.statusText}`);
        } else {
            handleSavePromoteShow()
            return;
        }
    };

    // Read localstorage's token
    useEffect(() => {
        if (!props.token) {
            const storedToken = getLocalStorage('token');
            if (storedToken) {
                props = {token: storedToken};
            }
            ;
        }
        ;
    }, []);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    useEffect(() => {
        getUserProducts();
    }, []);

    return (
        <section className="page-section bg-light" >
        <div className="container py-5 h-100">
            <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col col-xl-12">
                <div className="card h-100 py-5">
                <img className="rounded-3 mx-auto d-block shadow-4 mb-4 display-5 fw-bold" src={user.avatarURL} />
                <div className="row3 container">
                    <div id="comments" className="container" >
                        <form className="row">
                            <div className="mb-3 col-md-4">
                                <label className="form-label col">User Name</label>
                                <input className="form-control"
                                       type="text"
                                       name="username"
                                       onChange={onChange}
                                       maxLength={30}
                                       minLength={4}
                                       defaultValue={user.username}
                                ></input>
                            </div>
                            <div className="mb-3 col-md-4">
                                <label className="form-label col">First Name</label>
                                <input className="form-control"
                                       type="text"
                                       name="firstname"
                                       maxLength={30}
                                       minLength={4}
                                       onChange={onChange}
                                       defaultValue={user.firstname}
                                ></input>
                            </div>
                            <div className="mb-3 col-md-4">
                                <label className="form-label col">Last Name</label>
                                <input className="form-control"
                                       type="text"
                                       name="lastname"
                                       onChange={onChange}
                                       maxLength={30}
                                       minLength={4}
                                       defaultValue={user.lastname}
                                ></input>
                            </div>
                            <div className="mb-3 col-md-4">
                                <label className="form-label">Email</label>
                                <input className="form-control"
                                       type="text"
                                       disabled="disabled"
                                       name="email"
                                       onChange={onChange}
                                       defaultValue={user.email}
                                ></input>
                            </div>
                            <div className="mb-3 col-md-4">
                                <label className="form-label">Phone</label>
                                <input className="form-control"
                                       type="text"
                                       name="phone"
                                       onChange={onChange}
                                       maxLength={13}
                                       minLength={9}
                                       defaultValue={user.phone}
                                ></input>
                            </div>
                            <div className="mb-3 col-md-4">
                                <label className="form-label">Join Time</label>
                                <input className="form-control"
                                       type="text"
                                       disabled="disabled"
                                       defaultValue={user.joinTime}
                                ></input>
                            </div>
                            <div className="mb-3 col-12">
                                <label className="form-label">User Description (200 characters limit)</label>
                                <textarea className="form-control"
                                          name="bio"
                                          onChange={onChange}
                                          maxLength={200}
                                          defaultValue={user.bio}
                                ></textarea>
                            </div>
                        </form>
                        <div>
                        {/* <a href="javascript:void(0)" onClick={() => this.handleEdit(user)}>Edit</a> */}
                        <input
                            className="btn btn-lg btn-dark"
                            type="submit"
                            value="Save"
                            onClick={sendForm}
                        />
                </div>

                    </div>
                    
            </div>
            <Modal show={showError} onHide={handleErrorClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>{errorMsg}</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleErrorClose}>
                        Ok
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showSavePromote} onHide={handleSavePromoteClose}>
                <Modal.Header closeButton>
                    {/*<Modal.Title>Error</Modal.Title>*/}
                </Modal.Header>
                <Modal.Body>WHOO! Saved successfully!</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleSavePromoteClose}>
                        Ok
                    </Button>
                </Modal.Footer>
            </Modal>
                
                </div>
            </div>
            </div>
        </div>
        </section>
    )
}

export default UserPage;
