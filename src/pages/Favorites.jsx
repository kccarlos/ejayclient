import React, {useState, useEffect, useMemo} from "react";
import {
    BrowserRouter,
    Route,
    Routes,
    Link, useNavigate,
} from "react-router-dom";
import {getLocalStorage} from "../utils/localStorage";
import CircularProgress from '@mui/material/CircularProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
// import ProgressiveImg from "./components/ProgressiveImg.png";

import { BACKEND_ADDR } from "./const";

function Favorites(props) {
    const [user, setUser] = useState([]);
    const [products, setProducts] = useState([]);
    const [userID, setUserID] = useState(window.location.pathname.split("/")[2]);
    const [received, setReceived] = useState(false);
    const [tabNum, setTabNum] = useState(0);
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    const [showError, setShowError] = useState(false);
    const [errorMsg, setErrorMSg] = useState("");

    const handleDelete = (e, id) => {
        e.preventDefault();
        const updatedUser = {...user, favorites: user.favorites.filter(fav => fav !== id)};
        setUser(updatedUser);
        sendForm(updatedUser);
    };

    const miniContainer = (prod) => {
        return (
            <>
                <hr className="my-4"/>
                <div className="row mb-4 d-flex justify-content-between align-items-center">
                    <div className="col-md-2 col-lg-2 col-xl-2">
                        <Link to={`/product/${prod._id}`}>
                            <img src={prod.image} className="img-fluid rounded-3" alt="Cotton T-shirt"
                                 //placeholder={ProgressiveImg}
                            />
                        </Link>
                    </div>
                    <div className="col-md-3 col-lg-3 col-xl-3">
                        <Link to={`/product/${prod._id}`}>
                            <h6 className="text-muted">{prod.title}</h6>
                        </Link>
                        <h6 className="text-black mb-0">{prod.description}</h6>
                    </div>
                    <div className="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
                        <h6 className="mb-0">$ {prod.price}</h6>
                    </div>
                    <div className="col-md-1 col-lg-1 col-xl-1 ">
                        <IconButton aria-label="delete" size="small" onClick={(e) => handleDelete(e, prod._id)}>
                            <DeleteIcon fontSize="inherit"/>
                        </IconButton>
                    </div>
                </div>
            </>
        );
    };

    async function fetchUserProfile() {
        const response = await fetch(`${BACKEND_ADDR}/api/auth`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": getLocalStorage('token'),
            },
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

    async function getUserFavorites() {
        const response = await fetch(`${BACKEND_ADDR}/api/getFavorites`, {
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
        setReceived(true);
        const userProducts = await response.json();
        setProducts(userProducts);
    }

    const sendForm = async (updatedUser) => {
        const response = await fetch(`${BACKEND_ADDR}/updateFavorites`, {
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
            getUserFavorites();
            return;
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    useEffect(() => {
        getUserFavorites();
    }, [user]);

    const List = useMemo(() => {
        return (
            <>
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <h1 className="fw-bold mb-0 text-black">Favorites</h1>
                    <h6 className="mb-0 text-muted">{products.length} items</h6>
                </div>
                {received ? products.map(
                    prod => {
                        return (miniContainer(prod))
                    }
                ) : <CircularProgress color="inherit"/>}
            </>
        );
    }, [products, received]);

    return (
        <section className="page-section bg-light" >
                <div className="container py-5 h-100">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-12">
                            <div className="card card-registration card-registration-2" style={{borderRadius: '15px'}}>
                                <div className="card-body p-0">
                                    <div className="row g-0">
                                        <div className="col-lg-12">
                                            <div className="p-5">
                                                {List}
                                                <hr className="my-4"/>
                                                <div className="pt-5">
                                                    <h6 className="mb-0"><Link to='/' className="text-body"><i
                                                        className="fas fa-long-arrow-alt-left me-2"/>Back to shop</Link>
                                                    </h6>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
    );
}

export default Favorites;
