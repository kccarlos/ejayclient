import React, {Component} from "react";
import {useResource} from 'rest-hooks';
import {Tags} from "./const";
import app from "../App";
import axios from "axios";
import {Link, Routes, Route, useNavigate} from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.css';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import {Autocomplete, TextField, Chip} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import {useForm} from "react-hook-form";
import {getLocalStorage} from "../utils/localStorage";

// const multer = require('multer')
import { BACKEND_ADDR } from "./const";

const freeTagOptions = ['Ikea furniture', 'table', 'chair', 'Lego', 'toy', 'car', 'Ikea storage', 'shelf'];

const tags = [];
const token = getLocalStorage('token');
let fetchInfo = ({id}) => {
    fetch(`${BACKEND_ADDR}/product/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": token,
            },
        }
    ).then(response => response.json())
};

// import {Map, GoogleApiWrapper, Marker} from 'google-maps-react';

class UpdateProduct extends Component {

    constructor(props) {
        super(props);
        this.handleChangeTitle = this.handleChangeTitle.bind(this);
        this.handleChangeDescription = this.handleChangeDescription.bind(this);
        this.handleChangePrice = this.handleChangePrice.bind(this);
        this.handleChangeMedia = this.handleChangeMedia.bind(this);
        this.handleChangeCategories = this.handleChangeCategories.bind(this);
        // freestyle tags, user can add any tags
        this.handleChangeTags = this.handleChangeTags.bind(this);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.getUserCoordinates = this.getUserCoordinates.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        // TODO: change the function implementation into class approach
        // this.navigationize = this.navigationize.bind(this)
        // const [productID, setProductID] = useState(
        //     window.location.pathname.split("/")[2]
        // );
        console.log({productID: window.location.pathname.split("/")[2]})
        this.setState({productID: window.location.pathname.split("/")[2]})
        const res = async () => {
            const res = await fetch(`${BACKEND_ADDR}/product/${window.location.pathname.split("/")[2]}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": token,
                }
            })
            const product = await res.json()
            this.setState({
                _id: product[0]._id,
                title: product[0].title,
                description: product[0].description,
                price: product[0].price,
                media: product[0].media,
                negotiable: product[0].negotiable,
                tags: product[0].tags,
                keywords:product[0].keywords
            })
            console.log(product[0])
        }
        res()
        // console.log(this.state.productID)
        // console.log(product)
        this.state = {
            categories: '',
            keywords: [], // freestyle tags, any tags user added
            latitude: '',
            longitude: '',
            show: '',
            isSubmitting: '',
            resState: '',
        };

        // const { handleSubmit, formState } = useForm()
        // const { isSubmitting } = formState
        // this.setState({userID: window.location.pathname.split('/')[2]})
        // this.userID = window.location.pathname.split('/')[2];
    }

    // navigationize() {
    //     useNavigate('/')
    // }

    handleChangeTitle(event) {
        this.setState({title: event.target.value})
    }

    handleChangeDescription(event) {
        this.setState({description: event.target.value})
    }

    handleChangeNegotiable(event) {
        this.setState({negotiable: event.target.value})
    }

    handleChangePrice(event) {
        this.setState({price: event.target.value})
    }

    handleChangeMedia(event) {
        this.setState({media: [...this.state.media, ...event.target.files]})
    }

    handleChangeCategories(event) {
        this.setState({categories: event.target.value})
    }

    handleChangeTags(event) {
        console.log(event)
        // if(event)
        if (event.type === 'keydown' && event.key === 'Enter') { // add a tag when user press enter
            tags.push(event.target.value);
        } else { // click: 1. remove a tag 2. select from the dropdown list
            if (event.target.id === "" || event.target.innerHTML === "") { // remove a tag
                tags.pop();
            } else { // select from the dropdown list
                tags.push(event.target.innerHTML);
            }
        }
        console.log("tags: ", tags)
        this.setState({keywords: tags})
    }

    handleShow(event) {
        console.log("show")
        this.setState({show: true})
    }

    handleClose(event) {
        this.setState({show: false})
    }

    handleSubmit(event) {
        const form = document.querySelector('.needs-validation')
        event.preventDefault();
        if (!form.checkValidity()) {
            event.stopPropagation()
        }

        if ((this.state.latitude <= 0) || (this.state.longitude.length <= 0)) {
            document.querySelector("#locButton").classList.add('is-invalid');
            form.classList.add('was-validated')
            return
        }
        form.classList.add('was-validated')

        this.handleShow()
        // alert('A product was submitted: ' + this.state.title)
        let formData = new FormData();

        formData.append('title', this.state.title)
        formData.append('description', this.state.description)
        // formData.append('price', this.state.price)
        for (const key of Object.keys(this.state.media)) {
            formData.append('media', this.state.media[key])
        }
        formData.append('tags', this.state.categories)
        formData.append('keyWords', this.state.keywords)
        // form.append('seller', this.props.token)
        formData.append('seller', this.userID)
        // form.append('_id', this.userID)

        axios.post(`${BACKEND_ADDR}/api/new-product`, formData, {}).then(res => {
            console.log(res.data)
            console.log(this.props.token)
        })
        // this.props.history.push('/')
    }

    getUserCoordinates() {
        if (!navigator.geolocation) {
            console.log('Geolocation API is not available in your browser!')
        } else {
            navigator.geolocation.getCurrentPosition((position) => {
                console.log([position.coords.latitude, position.coords.longitude])
                this.setState({latitude: position.coords.latitude})
                this.setState({longitude: position.coords.longitude})
            }, (error) => {
                console.log('Something went wrong getting your position!')
            })
        }
    }

    render() {
        return (
            //TODO: add maps feature to select location
            <section className="page-section bg-light">
                <div className="container">

                    <div className="row d-flex justify-content-center align-items-center h-100">

                        <div className="col-12">

                            <div className="card card-registration card-registration-2" style={{borderRadius: '15px'}}>

                                <div className="card-body p-0">

                                    <div className="row g-0">

                                        <div className="col-lg-12">

                                            <div className="p-5">

                                            <div className="md3 container" id="comments">
                                            <div className="d-flex justify-content-between align-items-center mb-5">
                    <h1 className="fw-bold mb-0 text-black">Upload your product to sell!</h1>
                </div>

                    <form onSubmit={this.handleSubmit} className="needs-validation">

                        <div className="mb-3">
                            <label className="form-label">Product Title:</label>
                            <input type="text" name="title" className="form-control" onChange={this.handleChangeTitle}
                                   defaultValue={this.state.title}
                                   required/>
                        </div>
                        <label className="form-label">Price:</label>
                        <div className="input-group mb-3">
                            <span className="input-group-text">$</span>
                            <input type="number" className="form-control" name="price" step="0.01"
                                   disabled="disabled"
                                   defaultValue={this.state.price} required/>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Description * :</label>
                            <textarea className="form-control form-text" name="description"
                                      defaultValue={this.state.description}
                                      onChange={this.handleChangeDescription} rows="3" required/>
                            <div className="form-text">
                                Your description should be less than 100 characters.
                            </div>
                        </div>
                        {/*send images to backend then backend send images to hosting storage*/}
                        <div className="mb-3">
                            <label className="form-label">
                                Select your product categories:
                                <select className=" form-select form-select-lg mb-3" name="categories" id="categories"
                                        multiple={true} onChange={this.handleChangeCategories}
                                        defaultValue={this.state.categories}
                                        required>
                                    <option value="any">Any</option>
                                    <option value="furniture">Furniture</option>
                                    <option value="book">Book</option>
                                    <option value="cookware & tableware">Cookware & Tableware</option>
                                    <option value="children & nursery">Children & Nursery</option>
                                    <option value="storage & organization">Storage & Organization</option>
                                </select>
                            </label>
                        </div>

                        {/*freestyle tags*/}
                        <div className="mb-3">
                            <label className="form-label">What else tags would you like to add (max 20 characters per tag):</label>
                            <Autocomplete
                                onChange={this.handleChangeTags}
                                multiple
                                id="free-tags"
                                // options={freeTagOptions.map(option=>option.title)}
                                options={freeTagOptions}
                                // getOptionLabel={option}
                                filterSelectedOptions
                                freeSolo
                                defaultValue={this.state.keywords}
                                renderTags={(value, getTagProps) => value.map((option, index) => (
                                    <Chip variant="filled" label={option} {...getTagProps({index})}/>
                                ))}
                                renderInput={(params) => (
                                    <TextField {...params} variant="filled" maxLength={20} label="freestyle tags" placeholder="#tags"/>
                                )}>
                            </Autocomplete>
                        </div>

                        <div className="mb-3">
                                                            <div>
                                                                <input disabled={this.isSubmitting}
                                                                       className="btn btn-outline-secondary"
                                                                       type="submit"
                                                                       value="Submit"/>
                                                            </div>
                                                            <p></p>
                                                            <div>
                                                                {this.isSubmitting && (
                                                                    <CircularProgress color="inherit"/>
                                                                )}</div>
                                                        </div>
                    </form>
                                                </div>

                                                <Modal show={this.state.show} onHide={this.handleClose}>
                                                    <Modal.Header closeButton>
                                                        <Modal.Title>Modal heading</Modal.Title>
                                                    </Modal.Header>
                                                    {this.state.resState === 401 ?
                                                        <Modal.Body>401 Unauthorized: You are not a seller
                                                            yet</Modal.Body> :
                                                        <Modal.Body>Woohoo, you have submitted a
                                                            product {this.state.title}!</Modal.Body>
                                                    }
                                                    <Modal.Footer>

                                                        <Button variant="primary" onClick={this.handleClose}>
                                                            Ok
                                                        </Button>
                                                    </Modal.Footer>
                                                </Modal>
                                                <div className="pt-5">
                                                    <h6 className="mb-0">
                                                        <Link to='/' className="text-body"><i
                                                            className="fas fa-long-arrow-alt-left me-2"/>Back to
                                                            Home</Link>
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
}

export default UpdateProduct;