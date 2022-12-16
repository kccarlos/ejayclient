import React, {useState, useEffect, useMemo} from "react";
import {
    BrowserRouter,
    Route,
    Routes,
    Link, useNavigate,
} from "react-router-dom";
import Modal from 'react-bootstrap/Modal';
import Button from "react-bootstrap/Button";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import {getLocalStorage} from "../utils/localStorage";
import StepCard from "./components/StepCard";
import Rating from '@mui/material/Rating';
// import ProgressiveImg from "./components/ProgressiveImg.png";

import { BACKEND_ADDR } from "./const";

const token = localStorage.getItem('token');


function PublicUserPage(props) {
    // const [user, setUser] = useState([]);
    const navigate = useNavigate();
    const [userID, setUserID] = useState(
        window.location.pathname.split("/")[2]
    );
    const [publicUser, setPublicUser] = useState({});
    const [publicProducts, setPublicProducts] = useState([]);
    const [sellerRating, setSellerRating] = useState(0);
    const [buyerRating, setBuyerRating] = useState(0);
    const [soldProducts, setSoldProducts] = useState([0]);
    async function getUserInfo(userID) {
        const response = await fetch(`${BACKEND_ADDR}/api/getUserPublic/${userID}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            return;
        }
        const res = await response.json();
        // updatedEmail[buyerID] = buyerEmail;
        const temp_user = {
          _id : userID,
          email: res.email,
          avatarURL: res.avatarURL,
          username: res.username,
          bio: res.bio,
        };
        setPublicUser(temp_user);
        return;
    }

    async function getUserProducts() {
        const response = await fetch(`${BACKEND_ADDR}/api/getProductsPublic/${userID}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            // body: JSON.stringify(jsonData)
        });
        if (!response.ok) {
            if (response.status === 401) {
                navigate("/login");
                return;
            }
            window.alert(`Error: ${response.statusText}`);
            return;
        }

        const userProducts = await response.json();
        setPublicProducts(userProducts.filter(prod => prod.status !== 'approved' && prod.status !== 'completed' && prod.status !== 'deleted'));
    }

    async function getRating() {
        const response = await fetch(`${BACKEND_ADDR}/api/getRating?userID=${userID}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": getLocalStorage('token') ,
            },
        });
        if (!response.ok) {
            if (response.status === 401) {
                navigate("/login");
                return;
            }
            window.alert(`Error: ${response.statusText}`);
            return;
        }

        const rating = await response.json();
        setSellerRating( parseInt(rating.sellerRating));
        setBuyerRating( parseInt(rating.buyerRating));
    }
    
    const ratings = useMemo( () => {
        return (
            <>
            <div className="px-3">
                {
                    sellerRating <= 0? (
                        <p className="mb-1 h5">N/A</p>
                    ):(
                        <Rating className="mb-1 h5" name="half-rating-read" value={Math.max(sellerRating, 0)} precision={0.5} readOnly />
                    )
                }
                
                <p className="small text-muted mb-0">Rated As a Seller</p>
            </div>
            <div>
                {
                    buyerRating <= 0? (
                        <p className="mb-1 h5">N/A</p>
                    ): (
                        <Rating className="mb-1 h5" name="half-rating-read" value={Math.max(buyerRating, 0)} precision={0.5} readOnly />
                    )
                }
                <p className="small text-muted mb-0">Rated as a Buyer</p>
            </div>
            </>
        );
    }  ,[sellerRating, buyerRating]);

    const productList = useMemo( () => {
        return (
            <div>
                {publicProducts.length === 0 && (
                <div className="row g-2">
                <div className="col mb-2">
                    The User Hasn't Sold any Products
                </div></div>
            )}
            <div className="fallcontainer" style={{display: 'flex', flexDirection: 'row', flexWrap:'wrap', alignItems:'center' }} >
            {publicProducts.map( (product, index) => 
            <div className="col-lg-3 col-sm-6 mb-4 mb-sm-0" >
                <Link to={`/product/${product._id}`}>
                <img src={product.image}
                alt="image 1" className="w-100 rounded-3" />
                </Link>
            </div>
            ) }
            </div>
            </div>
        );
    }, [publicProducts]);

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
        getUserInfo(userID);
    }, [userID]);

    useEffect(() => {
        getUserProducts();
        getRating();
    }, [publicUser]);

    return (
        <section className="page-section" >
            <div className="container py-5 h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col col-xl-12">
                        <div className="card">
                            <div className="rounded-top text-white d-flex flex-row bg-dark" style={{ height: 200 }}>
                                <div className="ms-4 mt-5 d-flex flex-column" style={{ width: 150 }}>
                                    {publicUser.avatarURL && (<img src={publicUser.avatarURL}
                                        alt="Generic placeholder image" className="img-fluid img-thumbnail mt-4 mb-2"
                                        style={{ width: 150, zIndex: 1 }} />)}
                                </div>
                                <div className="ms-3" style={{ marginTop: 130 }}>
                                    <h5>{publicUser.username}</h5>
                                </div>
                            </div>
                            <div className="p-4 text-black" style={{ backgroundColor: '#f8f9fa' }}>
                                <div className="d-flex justify-content-end text-center py-1">
                                    <div>
                                        <p className="mb-0 h4">{publicProducts.length}</p>
                                        <p className="small text-muted mb-0">Now Selling</p>
                                    </div>
                                    <div className="px-3">
                                        <p className="mb-0 h4">{soldProducts.length}</p>
                                        <p className="small text-muted mb-0">Product Sold</p>
                                    </div>
                                    {ratings}
                                </div>
                            </div>
                            <div className="card-body p-4 text-black">
                                <div className="mb-5">
                                    <p className="lead fw-normal mb-1">About</p>
                                    <div className="p-4" style={{ backgroundColor: '#f8f9fa' }}>
                                        {publicUser.bio}
                                    </div>
                                </div>
                                <div className="lead fw-normal mb-0">Selling Products</div>
                                <div className="d-flex justify-content-between align-items-center mb-4">

                                    {productList}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default PublicUserPage;
