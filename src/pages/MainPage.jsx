import React, { useState, useEffect, useMemo, useRef, createRef } from "react";
import Post from "./components/Post";
import { Tags } from "./const";
import { Link } from "react-router-dom";
import KeyWordMatch from "../models/KeyWordMatch";
import MultiRangeSlider from "./components/MultiRangeSlider";
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControl from '@mui/material/FormControl';
import Slider from '@mui/material/Slider';
import { StopWords } from "./const";
import { getLocalStorage } from "../utils/localStorage";
import {
    createTheme,
    responsiveFontSizes,
    ThemeProvider,
  } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RecommendIcon from '@mui/icons-material/Recommend';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import '../css/styles.css'

import Radio from "@mui/material/Radio";
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { FormLabel } from "@mui/material";

import { BACKEND_ADDR } from "./const";

import {GoogleMapsApiKey} from "./const";
import {MapApiJs} from "./const";

let theme = createTheme();
theme = responsiveFontSizes(theme);

// var token = getLocalStorage('token');

const categories = [
    'furniture',
    'book',
    'cookware & tableware',
    'children & nursery',
    'storage & organization'
];

const marks = [
    {
      value: 0,
      label: '$0',
    },
    {
      value: 20,
      label: '$20',
    },
    {
      value: 50,
      label: '$50',
    },
    {
      value: 100,
      label: '$100',
    },
    ];


// load google map api js
function loadGoogleMapApiJs(src){
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

function MainPage() {

    const [token, setToken] = useState(getLocalStorage('token')); // token

    const [rawProducts, setRawProducts] = useState([]); // raw data
    const [products, setProducts] = useState([]); // filtered data to display
    const [found, setFound] = useState(false);
    const [query, setQuery] = useState([]);
    const [filter, setFilter] = useState([]);
    const [priceLowerLimit, setPriceLowerLimit] = useState('');
    const [priceUpperLimit, setPriceUpperLimit] = useState('');
    // const [priceLimit, setPriceLimit] = useState();
    const [order, setOrder] = useState('default');

    const [user, setUser] = useState(''); // set user info
    const [history, setHistory] = useState([]); // get user browsing history

    const [recommendations, setRecommendations] = useState([]); // filt recommendatoins to display
    const [category, setCategory] = useState('');
    const [foundRecommend, setFoundRecommend] = useState(false);
    const [foundCatogary, setFoundCatogary] = useState(false);

    const allItemsAnchor = useRef(null) 
    const recomAnchor = useRef(null)

    const [keyWords, setKeyWords] = useState([]);

    const [deliverMethod, setDeliverMethod] = useState('deliver');
    const [distance, setDistance] = useState('');
    const [location, setLocation] = useState('');
    const [coordinates, setCoordinates] = useState([]);

    async function getProducts() {
        const response = await fetch(`${BACKEND_ADDR}/`);
        if (!response.ok) {
        window.alert(`Error: ${response.statusText}`);
        return;
        }
        const records = await response.json();
        setProducts(records.filter((record) => record.status !== 'deleted' && record.status !== 'approved' && record.status !== 'completed'));
        // console.log('test prod =', records[0]);
        setRawProducts(records.filter((record) => record.status !== 'deleted' && record.status !== 'approved' && record.status !== 'completed'));
        for (let i = 0; i < records.length; i++) {
            let text =  records[i].title.replace(/[0-9]/g, '');
            let titleWords = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").split(' ');
            if (records[i].keyWords) {
                titleWords.concat(records[i].keyWords);
            }
            setKeyWords((oldValues) => [...new Set([...oldValues, ...titleWords.filter(word => !StopWords.includes(word.toLowerCase()) && !keyWords.includes(word.toLowerCase()) ).map(word => word.toLowerCase())])]);
        }
    }

    async function getProductsByDistance(coor, dist){
        const response = await fetch(`${BACKEND_ADDR}/api/pickupDistance`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": getLocalStorage(('token')),
            },
            body: JSON.stringify({coor, dist}),
        });
        if (!response.ok) {
            // console.log(response);
            window.alert(`Error: ${response.statusText}`);
            return;
        }
        const records = await response.json();
        // console.log('products account: ', records.length);
        setProducts(records.filter((record) => record.status !== 'deleted' && record.status !== 'approved' && record.status !== 'completed'));
    }



    async function getUser(token){
        if(token){
            const response = await fetch(`${BACKEND_ADDR}/api/auth`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": token,
                },
            });
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.clear();
                    return;
                }
                return;
            }
            const userProfile = await response.json();
            setUser(userProfile)
        }
    }

    async function getBrowsingHistory(token){
        if(token){
            const response = await fetch(`${BACKEND_ADDR}/api/getHistory`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": token,
                },
            });
            if (!response.ok) {
                window.alert(`Error: ${response.statusText}`);
                return false;
            }
            const browsingHistory = await response.json();
            // console.log("browsing history: ", browsingHistory);
            let cat = browsingHistory[browsingHistory.length - 1];
            // console.log("browsing history main category: ", cat);
            setCategory(cat);
            setHistory(browsingHistory);
                        
        }
    }

    async function getRecommendations(token) {
        // await getBrowsingHistory(token);
        if(token&&history.length>0&&category.length>0){
            // console.log(token);
            // console.log("history: ", history);
            const response = await fetch(`${BACKEND_ADDR}/api/recommend`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": token,
                },
                body: JSON.stringify(history),
            });
            if (!response.ok) {
                window.alert(`Error: ${response.statusText}`);
                return;
            }
            const res = await response.json();
            // console.log("recommendations: ", res);
            var recommend = [];
            // var category = res[res.length - 1];
            for (let i = 0; i < res.length; i++) {
                if(res[i].split('.').length>1){
                    recommend[i] = res[i].split('.')[1].toLowerCase();
                }
                else{
                    recommend[i] = res[i].toLowerCase();
                }
            }
            // console.log(recommend);
            // console.log(category);
            let filtered = KeyWordMatch(rawProducts, recommend);
            // console.log("after filtering: ", filtered);
            if (filtered.length !== 0) {
                // console.log("recommendations found");
                setRecommendations(filtered);
                setFoundRecommend(true);
            } else{
                // console.log("recommendations not found, will use category");
                // setCategory(category.toLowerCase());
                // console.log("category: ", category);
                setFoundCatogary(true);
            }
        }
        else{
            if(!token){
                console.log("no token, no recommendation");
            }
            else if(history.length==0){
                console.log("no browsing history, no recommendation");
            }
            else{
                console.log("ooooops, your interests are toooo wide to give recommendation");
            }
        }
    }

    const handleFilterChange = (event) => {
        const {
          target: { value },
        } = event;
        setFilter(
          // On autofill we get a stringified value.
          typeof value === 'string' ? value.split(',') : value,
        );
        };

        const handleDeliverMethodChange = (event) => {
            setDeliverMethod(event.target.value);
            // console.log(event.target.value);
            if(event.target.value === 'deliver'){
                getProducts();
            }
        };
    
    
    // init google map script
    const initMapScript = () => {
        // if script already exists, do nothing
        if(window.google){
            return Promise.resolve();
        }
        const src = `${MapApiJs}?key=${GoogleMapsApiKey}&libraries=places`;
        return loadGoogleMapApiJs(src);
    };
    
    
    const onLocationChange = (autocomplete) => {
        // console.log(autocomplete.getPlace());
        const lat = autocomplete.getPlace().geometry.location.lat();
        const lng = autocomplete.getPlace().geometry.location.lng();
        // console.log(lat, lng);
        const coor = [lat, lng];
        setCoordinates(coor);
        if(distance){
            getProductsByDistance(coor, distance);
        }
    }
    
    const handleAutocomplete = (event) => {
        const autocomplete = new window.google.maps.places.Autocomplete(event.target);
        autocomplete.setFields(['address_components', 'geometry']);
        autocomplete.addListener('place_changed', () => {
            onLocationChange(autocomplete);
        });
    };

    const handleDistanceSelected = (event) => {
        setDistance(event.target.value);
        // console.log(event.target.value);
        getProductsByDistance(coordinates, event.target.value);
    };

    useEffect(() => {
        setToken(getLocalStorage('token'));
        getProducts();
        getUser(getLocalStorage('token'));
        getBrowsingHistory(token);
        // getRecommendations(token);
        initMapScript().then(() => {
            // console.log('google map script loaded', window.google);
        });
    }, [token]); //only token change will trigger useEffect


    useEffect(() => {
        getRecommendations(token);
    }, [history]); //only history change will trigger useEffect

    // useEffect(() => {
    //     getRecommendations(token);
    // }, [token]);

    useEffect(() => {
        if (query.length !== 0) {
            let filtered = KeyWordMatch(rawProducts, query)
            if (filtered.length !== 0) {
                setProducts(filtered);
                setFound(true);
            } else{
                setFound(false);
                setProducts(rawProducts);
            }
        } else {
            setFound(false);
            setProducts(rawProducts);
        }
                
    }, [query]);

    const containerStyle = {
        webkitColumnSidth: '354px',  
        mozColumnWidth: '354px',    
        oColumnWidth: '354px', /*Opera*/
        msColumnWidth: '354px', /*IE*/
        columnWidth:'354px',
    }

    const displayPost = useMemo(() => {
        const filtered_products = products.filter(ele => (filter.length === 0 || ele.tags.some(tag => filter.includes(Tags[tag]))))
            .filter(ele => (priceLowerLimit === '' || ele.price >= parseInt(priceLowerLimit)))
            .filter(ele => (priceUpperLimit === '' || ele.price <= parseInt(priceUpperLimit)))
            .sort((a, b) => {
                if (order === 'default') {return 0}
                if (order === 'increase') {return parseFloat(a.price) - parseFloat(b.price)}
                if (order === 'decrease') {return parseFloat(b.price) - parseFloat(a.price)}
            })
        // console.log(filtered_products)
        if (filtered_products.length > 0) {
                const out= (filtered_products.map(product =>(
                    <Post
                        productLink={`/product/${product._id}`}
                        sellerLink={`/user-page/${product.seller}`}
                        title={product.title}  sellerID={product.seller}
                        imgURL={product.mediaURLs[0]}
                        description={product.description}
                        price={product.price}
                        create_time={product.create_time}
                    />
                )))
            return(
                <div id="fallcontainer"> {out}</div>)
            }
        return (<div style={{textAlign:'center' }}> <h2>We're sorry! No matched results found!</h2> </div>)
    });

    return (
        <div className="content-container " >
                {/* Recommendations or recommend from Category */}
                <header className="masthead">
                    <div className="container">
                        <div className="imgBox" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <img src="/eJayBrand.svg" alt="abc" height="auto" width="60%" id="image-section"/>
                        </div>
                        <div className="masthead-subheading"></div>
                        <div style={{textAlign:'center' }}>

                        {token === null? <p>Login to sell, buy, and see recommendations </p>: 
                        // (foundRecommend || foundCatogary)&&history.length>0?
                        <ThemeProvider theme={theme}>
                            { user.isSeller ? (<>
                            <Typography variant="h5">
                                <Link to={`/new-product/${user._id}`} style={{ textDecoration: 'none', color:"black" }}>
                                    <button className="btn btn-outline-light flex-shrink-0" type="button"> Sell New Product!</button>
                                </Link>
                                <button className="btn btn-outline-light flex-shrink-0" type="button" onClick={()=> allItemsAnchor.current.scrollIntoView() }> Browse All Products!</button>
                            </Typography>  
                            </>) : 
                            <Typography variant="h5">
                            <Link to={`/orders`} style={{ textDecoration: 'none', color:"black" }}>
                                <button className="btn btn-outline-light flex-shrink-0" type="button"> Become a seller to sell!</button>
                                <button className="btn btn-outline-light flex-shrink-0" type="button" onClick={()=> allItemsAnchor.current.scrollIntoView() }> Browse All Products!</button>
                            </Link>
                            </Typography>
                            }
                            
                        </ThemeProvider>
                        // :
                        // <ThemeProvider theme={theme}>
                        //     <Typography variant="h5">
                        //         <Link to={`/new-product/${user._id}`} style={{ textDecoration: 'none', color:"black" }}><button className="btn btn-outline-light flex-shrink-0" type="button"> Sell New Product!</button></Link>
                        //         <button className="btn btn-outline-light flex-shrink-0" type="button" onClick={()=> allItemsAnchor.current.scrollIntoView() }> Browse All Products!</button>
                        //     </Typography> 
                            
                        // </ThemeProvider>
                        }
                    </div> 
                    </div>
                    <div className="scroll-down" onClick={() => recomAnchor.current.scrollIntoView() } ></div>
                </header>
                <section className="page-section bg-light" id="portfolio"  >
            <div className="container">
                <div className="text-center">
                    <h2 className="section-heading text-uppercase">{
                        (foundRecommend || foundCatogary)&&history.length>0? (
                            <Typography variant="h5" ref={recomAnchor} >
                                <RecommendIcon />Recommendations
                                <h3 className="section-subheading text-muted"> based on your browsing history</h3>
                            </Typography>
                            
                        ):(
                            <Typography variant="h5" ref={recomAnchor}>
                                <ErrorOutlineIcon />Wow you are so myterious, we cannot guess your taste.
                                <h3 className="section-subheading text-muted"> explore more </h3>
                            </Typography>
                        )
                    }</h2>
                </div>
                <div className="row">
                {foundRecommend === true && history.length>0 ? recommendations.slice(0, 4).map(product => (
                                <Post 
                                    productLink={`/product/${product._id}`} 
                                    sellerLink={`/user-page/${product.seller}`} 
                                    title={product.title}  sellerID={product.seller} 
                                    imgURL={product.mediaURLs[0]} 
                                    description={product.description} 
                                    price={product.price} 
                                    create_time={product.create_time}
                                />
                            )) 
                        :""}
                        {foundCatogary === true && history.length>0 ? 
                            rawProducts.filter(product => product.tags.some(tag => Tags[tag] === category))
                            .slice(0, 4)
                            .map(product =>(
                                <Post 
                                    productLink={`/product/${product._id}`} 
                                    sellerLink={`/user-page/${product.seller}`} 
                                    title={product.title}  sellerID={product.seller} 
                                    imgURL={product.mediaURLs[0]} 
                                    description={product.description} 
                                    price={product.price} 
                                    create_time={product.create_time}
                                />
                            ))
                        :""}
                </div>
            </div>
        </section>
            
            <section className="py-4">
                <div style={{textAlign:'center' }} ref={allItemsAnchor}> 
                        {products.length !==0 || query.length === 0? <Typography variant="h5">All items </Typography>: <p className="lead fw-normal mb-0">sorry there are no matched items but we have the following items: </p>}
                </div>
                <div style={{margin: '3%'}}>
                    <Autocomplete
                        multiple
                        id="tags-standard"
                        options={keyWords}
                        onChange={(event, value, reason) => {setQuery(value)}}
                        // getOptionLabel={(option) => option.title}
                        renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="standard"
                            label="Search By Key Words"
                            placeholder="Type here "
                        />
                        )}
                    />
                </div>
                <div style={{display:'flex', flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between', marginRight: '3%', marginLeft:'3%'}}>
                    <div>
                        <FormControl sx={{ m: 1, width: 300 }}>
                            <InputLabel id="demo-multiple-chip-label">Category</InputLabel>
                            <Select
                            labelId="demo-multiple-chip-label"
                            id="demo-multiple-chip"
                            multiple
                            value={filter}
                            onChange={handleFilterChange}
                            input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={value} />
                                ))}
                                </Box>
                            )}
                            >
                            {categories.map((name) => (
                                <MenuItem
                                key={name}
                                value={name}
                                >
                                {name}
                                </MenuItem>
                            ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div>
                    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                        <Box sx={{ width: 300 }}>
                            <Slider
                                // getAriaLabel={`Always visible`}
                                aria-label="Always visible"
                                defaultValue={[0, Math.max(100,...products.map(o => o.price))]}
                                getAriaValueText={(value) => `${value}`}
                                marks={marks}
                                valueLabelDisplay="on"
                                onChange={(event, value) => {setPriceUpperLimit(value[1]);setPriceLowerLimit(value[0])}}
                            />
                        </Box>
                    </FormControl>
                    </div>
                    <div>
                        <FormControl sx={{ m: 1, minWidth: 300 }}>
                        <InputLabel>Sort by price:</InputLabel>
                        <Select
                            labelId="demo-select-small"
                            id="demo-select-small"
                            value={order}
                            label="order"
                            onChange={event => setOrder(event.target.value)}
                        >
                            <MenuItem value="default">Default</MenuItem>
                            <MenuItem value="increase">From low to high</MenuItem>
                            <MenuItem value="decrease">From high to low</MenuItem>
                        </Select>
                        </FormControl>
                    </div>
                </div>
            </section>
            <section className="py-4">
                <div style={{display:'flex', flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between', marginRight: '3%', marginLeft:'3%'}}>
                    <div className="col-3">
                        <FormControl sx={{m:1, width: 300}}>
                            <FormLabel id="demo-row-radio-buttons-group-label">Deliver Method</FormLabel>
                            <RadioGroup 
                                row 
                                aria-labelledby="demo-controlled-radio-buttons-group" 
                                name="controlled-radio-buttons-group"
                                value={deliverMethod}
                                onChange={handleDeliverMethodChange}>
                                    <FormControlLabel value="deliver" control={<Radio />} label="Deliver" />
                                    <FormControlLabel value="pickup" control={<Radio />} label="Pick Up" />
                            </RadioGroup>
                        </FormControl>
                    </div>
                    <div className="col-4">
                        {deliverMethod === "pickup" ?
                            <FormControl sx={{m:1, minwidth: 300}} fullWidth="true">
                                <TextField label="Your location" variant="standard" type="text" placeholder="Type your location here" onChange={handleAutocomplete}/>        
                            </FormControl>   
                        :""}
                    </div>
                    
                    {deliverMethod === "pickup" ?
                        <div className="col-3">
                            <FormControl sx={{m:1, minwidth: 300}} fullWidth="true">
                                <InputLabel>Pick up distance: </InputLabel>
                                <Select
                                    labelId="demo-select-small"
                                    id="demo-select-small"
                                    value={distance}
                                    label="distance"
                                    onChange={handleDistanceSelected}>
                                    
                                    <MenuItem value="1">1 mile</MenuItem>
                                    <MenuItem value="3">3 miles</MenuItem>
                                    <MenuItem value="5">5 miles</MenuItem>
                                
                                </Select>
                            </FormControl>
                        </div>
                    :""}
                    
                </div>
            </section>
            
            <section className="page-section bg-light container" id="portfolio">
                <div style={{textAlign:'center' }}> 
                    {products.length !==0 || query.length === 0? <h4><LoyaltyIcon /> What's on sale? </h4>: <h4 className="lead fw-normal mb-0">Sorry there are no matched items but we recommend the following items: </h4>}
                </div>
                <div className="row">
                    {/*<div id="fallcontainer">*/}
                        {/* <div className="row gx-lg-5 row-cols-2  row-cols-xl-4"> */}
                        {/* <div className="row gx-lg-5 row-cols-2  row-cols-xl-4"> */}
                            {/* <div className="col-lg-3 col-sm-6 mb-4 mb-sm-0"> */}

                        {displayPost}
                    {/*</div>*/}
                </div>
            </section>
        </div>
    );
}

export default MainPage;