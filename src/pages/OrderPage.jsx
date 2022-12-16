import React, { useState, useEffect, useMemo } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  Link,
  useNavigate,
} from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import { Rate } from 'antd';
import MiniList from "./components/MiniList";
// import Button from "react-bootstrap/Button";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { getLocalStorage } from "../utils/localStorage";
import StepCard from "./components/StepCard";
import Collapse from '@mui/material/Collapse';
import {CircularProgress} from "@mui/material";
import StarBorder from '@mui/icons-material/StarBorder';
import DraftsIcon from '@mui/icons-material/Drafts';
import SendIcon from '@mui/icons-material/Send';
import { TestOrders } from "./const";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import { BACKEND_ADDR } from "./const";
import { textAlign } from "@mui/system";

const DEFAULT_MESG = "Hi, please approve my deal!";

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
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Item = styled(Paper)(({theme}) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
}));

function OrderPage(props) {
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [userReceived, setUserReceived] = useState(false);
    const [products, setProducts] = useState([]);
    // const [orders, setOrders] = useState([]);
    const [userID, setUserID] = useState(window.location.pathname.split("/")[2]);
    const [openInactive, setOpenInactive] = useState(false);
    const [openActive, setOpenActive] = useState(true);
    const [tabNum, setTabNum] = useState(0);
    const [crtProdID, setCrtProdID] = useState(0);
    const [show, setShow] = useState(false);
    const [activeOrders, setActiveOrders] = useState([]);
    const [inactiveOrders, setInactiveOrders] = useState([]);

    const [confirm, setConfirm] = useState(false)
    const handleConfirmClose = () => setConfirm(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [showError, setShowError] = useState(false);
    const [errorMsg, setErrorMSg] = useState("");

    const handleErrorClose = () => setShowError(false);
    const handleErrorShow = () => setShowError(true);

    const [showSavePromote, setSavePromote] = useState(false);

    const handleSavePromoteClose = () => setSavePromote(false);
    const handleSavePromoteShow = () => setSavePromote(true);

  const [showMesgPopup, setShowMesgPopup] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

    const handleEmailSentClose = () => setShowSuccess(false);
    var mesgToSeller = DEFAULT_MESG;

    const handleOrder = async (productID) => {
        setShowMesgPopup(false);
        const message = mesgToSeller;
        const order = {
            productID,
            message,
        };
        // send email notification to seller
        const response = await fetch(`${BACKEND_ADDR}/api/sendEmail`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": getLocalStorage("token"),
            },
            body: JSON.stringify(order),
        });
        // console.log(response);
        if (!response.ok) {
          if (response.status === 401) {
                if (response.status === 401) {
                      navigate("/logout");
                      return;
                }
                return;
          }
            window.alert(`Error sending email: ${response.statusText}`);
            return;
        }

        setShowSuccess(true);
        return;
    };

    const handleCancel = async (productID) => {
        console.log("check product ID =", productID);
        setShowCancelPopup(false);

        const order = {
            productID
        };
       
        const response = await fetch(`${BACKEND_ADDR}/api/cancelOrder`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": getLocalStorage("token"),
            },
            body: JSON.stringify(order),
        });
        // console.log(response);
        if (!response.ok) {
            if (response.status === 401) {
                if (response.status === 401) {
                    navigate("/logout");
                    return;
                }
                return;
            }
            window.alert(`Error cancel order: ${response.statusText}`);
            return;
        }

        await getUserOrders();
        return;
    };

    const handleComplete = async (productId) => {
        console.log("check product ID =", productId);

        const order = {
            productId
        };

        console.log(order);
        
        const response = await fetch(`${BACKEND_ADDR}/api/completeOrder`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": getLocalStorage("token"),
            },
            body: JSON.stringify(order),
        });
        // console.log(response);
        if (!response.ok) {
            if (response.status === 401) {
                if (response.status === 401) {
                    navigate("/logout");
                    return;
                }
                return;
            }
            window.alert(`Error confirm: ${response.statusText}`);
            return;
        }

        setConfirm(true);
        await getUserOrders();

        // send notification to seller
        const response2 = await fetch(`${BACKEND_ADDR}/api/sendEmailSeller`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            "x-auth-token": getLocalStorage("token")
            },
            body: JSON.stringify(order),
        });

        return;
    };

    const sendForm = async (updatedUser) => {
        const response = await fetch(`${BACKEND_ADDR}/userProfile`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": getLocalStorage('token'),
            },
            body: JSON.stringify(updatedUser),
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

    async function fetchUserProfile() {
        const response = await fetch(`${BACKEND_ADDR}/api/auth`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": getLocalStorage("token"),
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
        setUserReceived(true);
        setUser(userProfile);
        setUserID(userProfile._id);
    }

    async function getUserProducts() {
        const response = await fetch(`${BACKEND_ADDR}/api/userproducts`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": getLocalStorage("token"),
            },
        });
        if (!response.ok) {
              if (response.status === 401) {
                    navigate("/logout");
                    return;
              }
            // window.alert(`Error: ${response.statusText}`);
            return;
        }

        const userProducts = await response.json();
        setProducts(userProducts);
    }

    async function getUserOrders() {
        const response = await fetch(`${BACKEND_ADDR}/api/getOrders`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": getLocalStorage('token'),
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
        const userOrders = await response.json();
        setActiveOrders(
            userOrders.filter(
                (order) => order.buyer === undefined || order.buyer === userID
            )
        );
        setInactiveOrders(
            userOrders.filter(
                (order) => order.buyer !== undefined && order.buyer !== userID
            )
        );
        // setOrders(userOrders);
    }

    // Read localstorage's token
    useEffect(() => {
        if (!props.token) {
            const storedToken = getLocalStorage("token");
            if (storedToken) {
                props = {token: storedToken};
            }
        }
    }, []);

    useEffect(() => {
        getUserProducts();
        getUserOrders();
    }, [userReceived]);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const sendEmailPopup = useMemo(() => {
        var message = "Email successfully sent to seller!";
        return (
            <Modal show={showSuccess} onHide={handleEmailSentClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Success</Modal.Title>
                </Modal.Header>
                <Modal.Body>{message}</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleEmailSentClose}>
                        Ok
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }, [showSuccess]);

    return (
        <section className="page-section bg-light">
            <div className="container">
                <Box sx={{width: "100%"}}>
                    <Box sx={{borderBottom: 1, borderColor: "divider"}}>
                        <Tabs
                            value={tabNum}
                            onChange={(event, newValue) => {
                                setTabNum(newValue);
                            }}
                            aria-label="basic tabs example"
                        >
                            <Tab label="Products Selling" {...a11yProps(0)} />
                            <Tab label="Orders" {...a11yProps(1)} />
                            {/* <Tab label="Orders Completed" {...a11yProps(2)} /> */}
                        </Tabs>
                    </Box>
                    <TabPanel value={tabNum} index={0}>
                        {user.isSeller ? (
                            <div className="row d-flex justify-content-center align-items-center">
                                <div className="col-12">
                                    <div
                                        className="card card-registration card-registration-2"
                                        style={{borderRadius: "15px"}}
                                    >
                                        <div className="card-body p-0">
                                            <div className="row g-0">
                                                <div className="col-lg-12">
                                                    <div className="p-5">
                                                        <div
                                                            className="d-flex justify-content-between align-items-center mb-5">
                                                            <h1 className="fw-bold mb-0 text-black">
                                                                You are selling
                                                            </h1>
                                                            <h6 className="mb-0 text-muted">
                                                                {products.length} items
                                                            </h6>
                                                        </div>
                                                        {products.length > 0 ? (
                                                            products.map((prod) => {
                                                                return (
                                                                    <List component="div">
                                                                        <Item
                                                                            className="list-group-item"
                                                                            style={{
                                                                                display: "flex",
                                                                                flexDirection: "row",
                                                                                flexWrap: "wrap",
                                                                            }}
                                                                        >
                                                                            <MiniList product={prod}/>
                                                                        </Item>
                                                                    </List>
                                                                );
                                                            })
                                                        ) : (
                                                            <p>No item selling</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <button className="btn btn-primary" onClick={handleShow}>
                                    Become a seller?
                                </button>
                                <Modal show={show} onHide={handleClose}>
                                    <Modal.Body>
                                        <h3>Are you ready to become a seller ? </h3>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <button
                                            type="button"
                                            className="btn btn-primary col-3"
                                            onClick={() => {
                                                let updatedUser = {...user, isSeller: 1};
                                                setUser(updatedUser);
                                                sendForm(updatedUser);
                                                handleClose();
                                                // close();
                                            }}
                                        >
                                            Yes
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary col-3"
                                            onClick={() => {
                                                handleClose();
                                            }}
                                        >
                                            Not yet
                                        </button>
                                    </Modal.Footer>
                                </Modal>
                            </div>
                        )}
                    </TabPanel>
                    <TabPanel value={tabNum} index={1}>
                        <div className="row d-flex justify-content-center align-items-center h-100">
                            <div className="col-12">
                                <div
                                    className="card card-registration card-registration-2"
                                    style={{borderRadius: "15px"}}
                                >
                                    <div className="card-body p-0">
                                        <div className="row g-0">
                                            <div className="col-lg-12">
                                                <div className="p-5">
                                                    <div
                                                        className="d-flex justify-content-between align-items-center mb-5">
                                                        <h1 className="fw-bold mb-0 text-black">
                                                            Orders
                                                        </h1>
                                                        <h6 className="mb-0 text-muted">
                                                            {activeOrders.length} active items
                                                        </h6>
                                                    </div>
                                                    {userReceived ? (
                                                        <div>
                                                            <ListItemButton
                                                                onClick={() => {
                                                                    setOpenActive(!openActive);
                                                                }}
                                                            >
                                                                <ListItemIcon>
                                                                    <InboxIcon/>
                                                                </ListItemIcon>
                                                                <ListItemText primary="Active Orders"/>
                                                                {openActive ? <ExpandLess/> : <ExpandMore/>}
                                                            </ListItemButton>
                                                            <Collapse
                                                                in={openActive}
                                                                timeout="auto"
                                                                unmountOnExit
                                                                sx={{color: "text.secondary"}}
                                                            >
                                                                {activeOrders.length > 0 ? (
                                                                    activeOrders.map((order) => {
                                                                        return (
                                                                            <List component="div">
                                                                                <Item
                                                                                    className="list-group-item"
                                                                                    style={{
                                                                                        display: "flex",
                                                                                        flexDirection: "row",
                                                                                        flexWrap: "wrap",
                                                                                    }}
                                                                                >
                                                                                    <Box sx={{width: "100%"}}>
                                                                                        <StepCard
                                                                                            order={order}
                                                                                            userId={userID}
                                                                                        />

                                                                                    </Box>
                                                                                    <Box sx={{mx: "auto"}}>
                                                                                        <Button
                                                                                            variant="outlined"
                                                                                            // sx={{m: 1}}
                                                                                            onClick={() => {
                                                                                                setShowMesgPopup(true);
                                                                                                setCrtProdID(order._id);
                                                                                            }}
                                                                                        >
                                                                                            Contact the seller
                                                                                        </Button>
                                                                                        <Button
                                                                                            variant="outlined"
                                                                                            sx={{m: 1}}
                                                                                            disabled={order.buyer !== undefined}
                                                                                            onClick={() => {
                                                                                                setShowCancelPopup(true);
                                                                                                setCrtProdID(order._id);
                                                                                            }}
                                                                                            color="error"
                                                                                        >
                                                                                            Cancel Order
                                                                                        </Button>
                                                                                        <Button variant="outlined"
                                                                                                // sx={{mr: 1}}
                                                                                                disabled={order.status == "completed" ||
                                                                                                          order.buyer === undefined}

                                                                                                onClick={() => {
                                                                                                    setCrtProdID(order._id);
                                                                                                    handleComplete(order._id);
                                                                                                }}
                                                                                        >Complete Order</Button>
                                                                                    </Box>
                                                                                </Item>
                                                                            </List>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <List component="div">
                                                                        <div>
                                                                            You don't have any active orders
                                                                        </div>
                                                                    </List>
                                                                )}
                                                            </Collapse>
                                                            <ListItemButton
                                                                onClick={() => {
                                                                    setOpenInactive(!openInactive);
                                                                }}
                                                            >
                                                                <ListItemIcon>
                                                                    <InboxIcon/>
                                                                </ListItemIcon>
                                                                <ListItemText primary="Inactive"/>
                                                                {openInactive ? (
                                                                    <ExpandLess/>
                                                                ) : (
                                                                    <ExpandMore/>
                                                                )}
                                                            </ListItemButton>
                                                            <Collapse
                                                                in={openInactive}
                                                                timeout="auto"
                                                                unmountOnExit
                                                            >
                                                                {inactiveOrders.length > 0 ? (
                                                                    inactiveOrders.map((order) => {
                                                                        return (
                                                                            <List component="div">
                                                                                <Item
                                                                                    className="list-group-item"
                                                                                    style={{
                                                                                        display: "flex",
                                                                                        flexDirection: "row",
                                                                                        flexWrap: "wrap",
                                                                                    }}
                                                                                >
                                                                                    <Box sx={{width: "100%"}}>
                                                                                        <StepCard
                                                                                            order={order}
                                                                                            userId={userID}
                                                                                        />
                                                                                    </Box>
                                                                                </Item>
                                                                            </List>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <div>
                                                                        You don't have any inactive orders
                                                                    </div>
                                                                )}
                                                            </Collapse>
                                                        </div>
                                                    ) : (
                                                        <CircularProgress/>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel value={tabNum} index={2}></TabPanel>
                </Box>
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
            <Modal
                show={showMesgPopup}
                onHide={() => {
                    setShowMesgPopup(false);
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Leave a message to seller</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <TextField
                        fullWidth
                        id="outlined-multiline-static"
                        label="Multiline"
                        multiline
                        rows={8}
                        defaultValue={DEFAULT_MESG}
                        onChange={(e) => {
                            mesgToSeller = e.target.value;
                        }}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => handleOrder(crtProdID)}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={showCancelPopup}
                onHide={() => {
                    setShowCancelPopup(false);
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Cancel Order</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Please confirm that you want to cancel this order
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => handleCancel(crtProdID)}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={confirm} onHide={handleConfirmClose}>
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>Order completed!</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleConfirmClose}>
                        Ok
                    </Button>
                </Modal.Footer>
            </Modal>

            {sendEmailPopup}
        </section>
    );
}

export default OrderPage;
