import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Boundary, CacheProvider, useConstantResourceController, useResource } from "react-suspense-boundary";
import Carousel from "react-bootstrap/Carousel";
import Badge from 'react-bootstrap/Badge';
import StarBorderIcon from "@mui/icons-material/StarBorder";
import CategoryIcon from '@mui/icons-material/Category';
import SellIcon from '@mui/icons-material/Sell';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import VerifiedIcon from '@mui/icons-material/Verified';
import DangerousRoundedIcon from '@mui/icons-material/DangerousRounded';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import PeopleIcon from '@mui/icons-material/People';
import Avatar from '@mui/material/Avatar';
import CardHeader from '@mui/material/CardHeader';
import { red, green } from '@mui/material/colors';
import { getLocalStorage } from "../utils/localStorage";

import CircularProgress from "@mui/material/CircularProgress";
import { styled } from '@mui/material/styles';
import { Tags } from "./const";
import Modal from "react-bootstrap/Modal";
import ModalUnstyled from '@mui/base/ModalUnstyled';
import Button from '@mui/material/Button';
import TextField from "@mui/material/TextField";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_ADDR } from "./const";
import { IconButton } from "@mui/material";
import { GoogleMapsApiKey, MapApiJs } from "./const";
import { GoogleMap, useJsApiLoader, Marker, MarkerF } from '@react-google-maps/api';

const DEFAULT_MESG = "Hi, I'm interested in this product!";

// Create or import an async function
// const fetchInfo = ({ id }) =>
//   fetch(`${BACKEND_ADDR}/product/${id}`).then((response) => response.json());

const token = getLocalStorage('token');
let fetchInfo = ({ id }) => fetch(`${BACKEND_ADDR}/product/${id}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "x-auth-token": token,
  },
}).then(response => response.json());

// load google map api js
function loadGoogleMapApiJs(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    Object.assign(script, {
      type: 'text/javascript',
      async: true,
      src
    });
    script.addEventListener("load", () => resolve(script));
    document.head.appendChild(script);
  });
}

function DetailPage(props) {
  const navigate = useNavigate();
  const [productID, setProductID] = useState(
    window.location.pathname.split("/")[2]
  );
  const [product] = useResource(fetchInfo, { id: productID });
  const [user, setUser] = useState({});
  const [seller, setSeller] = useState({});
  const [favorited, setFavorited] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const token = getLocalStorage("token");
  const [userReceived, setUserReceived] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [totalPrice, setTotalPrice] = useState(product[0].price);
  const [center, setCenter] = useState({
    lat: product[0].location[0],
    lng: product[0].location[1]
  });
  const [showMesgPopup, setShowMesgPopup] = useState(false);
  var mesgToSeller = DEFAULT_MESG;
  var quote = product[0].price;

  const onloadMarker = marker => {
    console.log(center)
    console.log('marker: ', marker)
  }

  const onChange = (e) => {
    mesgToSeller = e.target.value;
  };

  const quoteSetter = (e) => {
    quote = Math.max(e.target.value, 0);
    setTotalPrice(quote);
  };
  let latitude, longtitude, address;

  const handleAddAddress = (e) => {
    window.addAddress = e.target.value;
  };

  async function fetchUserProfile() {
    const response = await fetch(`${BACKEND_ADDR}/api/auth`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
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
    setFavorited(userProfile.favorites?.includes(productID));
    setOrdered(userProfile.orders?.includes(productID));
    setUser(userProfile);
    setUserReceived(true);
    setShowMesgPopup(false);
  }

  async function getSellerInfo(sellerID) {
    const response = await fetch(`${BACKEND_ADDR}/api/getUserPublic/${sellerID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // body: JSON.stringify({buyer: buyerID})
    });
    if (!response.ok) {
      return;
    }
    const seller = await response.json();

    setSeller(seller);
    return;
  }

  const sendForm = async (updatedUser) => {
    const response = await fetch(`${BACKEND_ADDR}/updateFavorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
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
      return;
    }
  };

  const handleAdd = () => {
    setFavorited(true);
    const updatedUser = { ...user, favorites: [...user.favorites, productID] };
    setUser(updatedUser);
    sendForm(updatedUser);
  };

  const handleRemove = () => {
    setFavorited(false);
    const updatedUser = {
      ...user,
      favorites: user.favorites.filter((fav) => fav !== productID),
    };
    setUser(updatedUser);
    sendForm(updatedUser);
  };

  const handleMakeOrder = () => {
    setShowMesgPopup(true);
  };

  const handleOrder = async () => {
    setShowMesgPopup(false);
    const message = mesgToSeller;
    let order = {
      productID,
      message,
      quote,
      latitude,
      longtitude,
      address
    };
    if (!product[0].isPickedUp) {
      if (window._addressinfo) {
        ({
          address: order.address,
          latitude: order.latitude,
          longitude: order.longtitude
        } = window._addressinfo);
      } else {
        window.alert(`Please select an address from the suggestions!`);
        return;
      }
    }
    console.log(order)
    // send email notification to seller
    const response = await fetch(`${BACKEND_ADDR}/api/sendEmail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify(order),
    });
    // console.log(response);
    if (!response.ok) {
      if (response.status === 401) {
        navigate("/logout");
        return;
      }
      window.alert(`Error sending email: ${response.statusText}`);
      return;
    }

    const response2 = await fetch(`${BACKEND_ADDR}/api/createOrder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify(order),
    });
    if (!response2.ok) {
      if (response2.status === 401) {
        navigate("/logout");
        return;
      }
      window.alert(`Error creating order: ${response2.statusText}`);
      return;
    }

    // await new Promise(r => setTimeout(r, 500));

    // const response3 = await fetch(`${BACKEND_ADDR}/api/sendEmailBuyer`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "x-auth-token": token,
    //   },
    //   body: JSON.stringify(order),
    // });

    // if (!response3.ok) {
    //   if (response3.status === 401) {
    //     navigate("/logout");
    //     return;
    //   }
    //   window.alert(`Error sending email: ${response3.statusText}`);
    //   return;
    // }

    setShowSuccess(true);
    return;
  };

  const handleFinishOrder = () => {
    setOrdered(true);
    setShowSuccess(false);
    return;
  };

  const handleReorder = () => {
    setShowSuccess(true);
  }

  const handleClose = () => {
    setShowMesgPopup(false);
  };

  useEffect(() => {
    if (getLocalStorage("token")) {
      fetchUserProfile();
    }

    if (!seller._id) {
      getSellerInfo(product[0].seller);
    }
    initMapScript().then(() => {
      console.log('google map script loaded', window.google);
    });
  }, []);

  const orderPopup = useMemo(() => {
    var message = "";
    var header = "";
    if (ordered) {
      message =
        "It seems you have already ordered this product. Please wait for seller's approval";
      header = "Whoops...";
    } else {
      header = "Success";
      message = "Order initiated! Please wait for seller's approval";
    }
    return (
      <Modal show={showSuccess} onHide={handleFinishOrder}>
        <Modal.Header closeButton>
          <Modal.Title>{header}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleFinishOrder}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }, [showSuccess]);

  const priceBlock = useMemo(() => {
    return (
      <div className="col-12 mb-4">
        <div className="row box-right">
          <div className="col-md-12 ps-0 ">
            <p className="ps-3 fw-bold h6 mb-0">Proposed Price</p>
            <p className="h1 fw-bold d-flex" style={{ padding: 20 }}>
              <span className="textmuted">${` `}</span>
              <TextField
                type="number"
                min="0"
                defaultValue={product[0].price}
                disabled={!product[0].negotiable}
                onChange={quoteSetter}
              />
            </p>
          </div>
          {/* <div className="col-md-12">
            <p className="p-org">
              <span className="fas fa-circle pe-2">Delivery Method</span>

            </p>
            <p className="fw-bold">
              <span>{product[0].isPickedUp ? "Pick-up" : "Delivery"}</span>
              <span className="fas fa-dollar-sign pe-1"> $</span>0
            </p>
          </div> */}
        </div>
      </div>
    );
  });

  // init google map script
  const initMapScript = () => {
    // if script already exists, do nothing
    if (window.google) {
      return Promise.resolve();
    }
    const src = `${MapApiJs}?key=${GoogleMapsApiKey}&libraries=places`;
    return loadGoogleMapApiJs(src);
  };

  const handleAutocomplete = (event) => {
    const autocomplete = new window.google.maps.places.Autocomplete(event.target);
    autocomplete.setFields(['formatted_address', 'geometry']);
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      window._addressinfo = {
        address: place.formatted_address,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng()
      };
    });
  };

  const leaveMsgPopup = useMemo(() => {
    return (
      <Modal show={showMesgPopup} onHide={handleClose} >
        <div className="payment-container">
          <Modal.Header closeButton>
            <Modal.Title>Payment Summary</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row m-0">
              <div className="col-md-12 col-12">
                <div className="row">
                  {priceBlock}
                  {
                    !product[0].isPickedUp && (
                      <div className="col-12 px-0 mb-4">
                        <div className="box-right">
                          <div className="d-flex pb-2">
                            <p className="fw-bold h7">Delivery Address</p>
                          </div>
                          <TextField variant="standard" type="text" placeholder="Input an address and select from the menu"
                            onChange={handleAutocomplete} fullWidth multiline={true} />
                          <TextField variant="standard" type="text" placeholder="Apartment/Suite Number (Optional)" fullWidth inputProps={{ maxLength: 30 }} onChange={handleAddAddress} />
                        </div>
                      </div>
                    )
                  }

                  <div className="col-12 px-0">
                    <div className="box-right">
                      <div className="d-flex mb-2">
                        <p className="fw-bold">Leave a message to seller</p>
                        <p className="ms-auto textmuted"><span className="fas fa-times"></span></p>
                      </div>
                      <div className="row">
                        <div className="col-12 mb-2">
                          <TextField
                            fullWidth
                            id="outlined-multiline-static"
                            multiline
                            rows={8}
                            defaultValue={DEFAULT_MESG}
                            onChange={onChange}
                          />
                        </div>
                        <div className="col-12 px-0" style={{ padding: '30px 25px' }}>
                          <Alert severity="warning">
                            <AlertTitle>Notice</AlertTitle>
                            You will <strong>NOT</strong> be charged until the seller approve the order.
                          </Alert>
                        </div>
                        <button className="btn btn-dark h8" style={{ float: 'right' }} onClick={handleOrder}>
                          Pay
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
        </div>
      </Modal>
    );
  }, [showMesgPopup]);

  const orderButton = useMemo(() => {
    if (ordered && userReceived && user._id !== seller._id) {
      return (
        <Button variant="contained" onClick={handleReorder} disabled>
          Ordered
        </Button>
      );
    } else if (userReceived && user._id !== seller._id) {
      return (
        <button variant="btn-dark" className="btn-dark btn" onClick={handleMakeOrder}>
          <i className="bi-cart-fill me-1"></i>
          Purchase
        </button>
      );
    }
  }, [ordered, userReceived, seller]);

  const favButton = useMemo(() => {
    if (favorited && userReceived) {
      return (

        <IconButton aria-label="unlike" onClick={handleRemove}>
          <FavoriteIcon sx={{ color: red[500] }} />
        </IconButton>
        // <Fab color="error" aria-label="like" onClick={handleRemove}>
        //   <FavoriteIcon />
        // </Fab>
      );
    } else if (userReceived) {
      return (
        <IconButton aria-label="like" onClick={handleAdd}>
          <FavoriteBorderIcon sx={{ color: red[500] }} />
        </IconButton>
        // <Fab aria-label="like" onClick={handleAdd}>
        //   <FavoriteBorderIcon sx={{color: red[500]}} />
        // </Fab>
      );
    }
  }, [favorited, userReceived]);

  var moment = require('moment');
  moment().format();

  // const locProps = {
  //     center: {
  //         lat: DEFAULT_LATITUDE,
  //         lng: DEFAULT_LONGTITUDE
  //     },
  //     zoom: 11
  // };
  //
  // const render = (status) => {
  //     return <h1>{status}</h1>;
  // };
  //
  const ref = useRef(null);
  const [map, setMap] = useState();

  const onLoad = useCallback(function callback(map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);

    setMap(map)
  }, [])

  const onUnmount = useCallback(function callback(map) {
    setMap(null)
  }, [])


  // useEffect(() => {
  //     if (ref.current && !map) {
  //         setMap(new window.google.maps.Map(ref.current, {center: locProps.center, zoom: 11}));
  //     }
  // }, [ref, map]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GoogleMapsApiKey
  })

  // const Marker = (options) => {
  //   const [marker, setMarker] = React.useState();
  //
  //   React.useEffect(() => {
  //     if (!marker) {
  //       setMarker(new google.maps.Marker());
  //     }
  //
  //     // remove marker from map on unmount
  //     return () => {
  //       if (marker) {
  //         marker.setMap(null);
  //       }
  //     };
  //   }, [marker]);
  //   React.useEffect(() => {
  //     if (marker) {
  //       marker.setOptions(options);
  //     }
  //   }, [marker, options]);
  //   return null;
  // };

  const posMap = (() => {
    console.log(isLoaded)
    return isLoaded ? (<div> <GoogleMap
      mapContainerStyle={{ height: '30%', width: '90%' }}
      center={center}
      zoom={11}
      onLoad={onLoad}
    // onUnmount={onUnmount}
    >
      {/*<Marker*/}
      {/*    icon={"https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"}*/}
      {/*    position={center} onLoad={onloadMarker}/>*/}
    </GoogleMap>
    </div>) : <div>Map loading...</div>
  })

  return (
    <section className="container col-12" >
      {userReceived ?
        (<div className=" px-4 px-lg-5 my-5 row" style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
          <div style={{ display: "flex", flexDirection: 'row', flexWrap: 'wrap', width: '100%' }}>
            <div className="col-md-6 gx-4 gx-lg-5 align-items-center" style={{ height: "500px", display: 'flex', alignItems: 'center', justifyContent:'center' }}>
              <Carousel slide={false} variant="dark">
                {product[0].mediaURLs.map((el, i) => (
                  <Carousel.Item>
                    <img
                      key={i}
                      src={el}
                      alt=""
                      className="card-img-top mb-5 mb-md-0 d-block"
                      style={{
                        display: "block",
                        marginRight: "auto",
                        marginLeft: "auto",
                        maxHeight: 500,
                        maxWidth: 450,
                        // height: "500px"
                        // width: "100px",
                        // maxHeights: 300,
                      }}>
                    </img>
                  </Carousel.Item>
                ))}
              </Carousel>
            </div>
            <div className="col-md-6 gx-4 gx-lg-5 align-items-center">
              <div className=" mb-1">
                {product[0].keyWords ? (
                  <div>
                    {product[0].keyWords.map((tag) => {
                      return (
                        <Badge pill bg="secondary">
                          {tag}
                        </Badge>
                      );
                    })}
                  </div>) : (
                  <div>
                  </div>
                )}
              </div>
              <h1 className="display-5 fw-bolder">{product[0].title}</h1>
              <div className="fs-6 mb-6">
                <CardHeader
                  avatar={
                    <Link to={`/user-page/${seller._id}`} style={{ textDecoration: 'none' }}>
                      <Avatar aria-label="recipe" src={seller.avatarURL} />
                    </Link>
                  }
                  title={
                    <Link to={`/user-page/${seller._id}`} style={{ textDecoration: 'none' }}>
                      {seller.username}
                    </Link>
                  }
                />

                {product[0].showContact ? <p><ContactMailIcon /> Contact: {seller.email}</p> : <></>}
                <p><SellIcon /> Price: ${product[0].price}</p>
                <p>{product[0].negotiable ? <span><VerifiedIcon sx={{ color: green[400] }} /> Price is negotiable </span> : <span><DangerousRoundedIcon sx={{ color: red[400] }} />Price not negotiable </span>}</p>
                <p><CategoryIcon /> Category: {Tags[product[0].tags]}</p>
                <p><AccessTimeFilledIcon /> Create time: {moment(product[0].create_time).fromNow()}</p>
                {product[0].isPickedUp ? <p><PeopleIcon /> Meet and trade </p> : <p><LocalShippingIcon /> Ship to trade </p>}

              </div>
              <div className="d-flex">
                {orderButton}
                {favButton}
              </div>
            </div>
          </div>
          <div style={{ height: "500px", display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '5%' }}>
            <div className="" ><b>Description:</b> {product[0].description}</div>
            {isLoaded ? <GoogleMap
              id={"product-map"}
              mapContainerStyle={{ height: '75%', width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', flexBasis: '100%' }}
              center={center}
              zoom={15}
              mapContainerClassName={""}
              onUnmount={onUnmount}
            >
              <MarkerF position={center} onLoad={onloadMarker} />
            </GoogleMap>
              : <div>Map loading...</div>
            }

          </div>
        </div>) : getLocalStorage("token") ? (
          <div>
            <CircularProgress color="inherit" />
          </div>) : (
          <div className="container">
            <div className="">
              <p className="text-center">
                Please <Link to="/login">login</Link> to see details
              </p>
            </div>
          </div>
        )}


      {orderPopup}
      {leaveMsgPopup}
    </section>
  );
}

export default () => {
  return (
    <CacheProvider>
      <Boundary pendingFallback={null}>
        <DetailPage />
      </Boundary>
    </CacheProvider>
  );
};
