import React, {Component} from "react";
import axios from "axios";
import {Link, Routes, Route, useNavigate} from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.css';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import {Autocomplete, TextField, Chip} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import {useForm} from "react-hook-form";
import Typography from '@mui/material/Typography';

// const multer = require('multer')
import {BACKEND_ADDR} from "./const";
import {UploadOutlined} from '@ant-design/icons';
// import {Button, Tooltip, Upload} from 'antd';
// import type {UploadFile, UploadProps} from 'antd/es/upload/interface';
import update from 'immutability-helper';
import {DndProvider, useDrag, useDrop} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';

const freeTagOptions = ['Ikea furniture', 'table', 'chair', 'Lego', 'toy', 'car', 'Ikea storage', 'shelf'];

const tags = [];

// import {Map, GoogleApiWrapper, Marker} from 'google-maps-react';

const type = 'DragableUploadList';

// interface
// DragableUploadListItemProps
// {
//     originNode: React.ReactElement < any, string | React.JSXElementConstructor < any >>;
//     file: UploadFile;
//     fileList: UploadFile[];
//     moveRow: (dragIndex: any, hoverIndex: any) => void;
// }
//
// const DragableUploadListItem = ({
//                                     originNode,
//                                     moveRow,
//                                     file,
//                                     fileList,
//                                 }: DragableUploadListItemProps) => {
//     const ref = useRef < HTMLDivElement > (null);
//     const index = fileList.indexOf(file);
//     const [{isOver, dropClassName}, drop] = useDrop({
//         accept: type,
//         collect: (monitor) => {
//             const {index: dragIndex} = monitor.getItem() || {};
//             if (dragIndex === index) {
//                 return {};
//             }
//             return {
//                 isOver: monitor.isOver(),
//                 dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
//             };
//         },
//         drop: (item: any) => {
//             moveRow(item.index, index);
//         },
//     });
//     const [, drag] = useDrag({
//         type,
//         item: {index},
//         collect: (monitor) => ({
//             isDragging: monitor.isDragging(),
//         }),
//     });
//     drop(drag(ref));
//     const errorNode = <Tooltip title="Upload Error">{originNode.props.children}</Tooltip>;
//     return (
//         <div
//             ref={ref}
//             className={`ant-upload-draggable-list-item ${isOver ? dropClassName : ''}`}
//             style={{cursor: 'move'}}
//         >
//             {file.status === 'error' ? errorNode : originNode}
//         </div>
//     );
// };

class NewProduct extends Component {

    constructor(props) {
        super(props);
        this.handleChangeTitle = this.handleChangeTitle.bind(this);
        this.handleChangeDescription = this.handleChangeDescription.bind(this);
        this.handleChangeNegotiable = this.handleChangeNegotiable.bind(this);
        this.handleChangeShowContact = this.handleChangeShowContact.bind(this);
        this.handleChangePickup = this.handleChangePickup.bind(this);
        this.handleChangePrice = this.handleChangePrice.bind(this);
        this.handleChangeMedia = this.handleChangeMedia.bind(this);
        this.handleChangeCategories = this.handleChangeCategories.bind(this);
        // freestyle tags, user can add any tags
        this.handleChangeTags = this.handleChangeTags.bind(this);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.getUserCoordinates = this.getUserCoordinates.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
        // this.navigationize = this.navigationize.bind(this)
        this.state = {
            title: '',
            description: '',
            price: '',
            negotiable: 'true',
            media: [],
            categories: '',
            keywords: [], // freestyle tags, any tags user added
            latitude: '',
            longitude: '',
            show: '',
            isSubmitting: '',
            resState: '',
            showContact: true,
            isPickedUp: false
        };

        // const { handleSubmit, formState } = useForm()
        // const { isSubmitting } = formState
        this.setState({userID: window.location.pathname.split('/')[2]})
        this.userID = window.location.pathname.split('/')[2];
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

    handleChangeShowContact(event) {
        this.setState({showContact: event.target.value})
    }

    handleChangePickup(event) {
        this.setState({isPickedUp: event.target.value})
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
        this.setState({show: true})
    }

    handleClose(event) {
        this.setState({show: false})
        return true

    }

    handleSubmit(event) {
        const form = document.querySelector('.needs-validation')
        event.preventDefault();
        if (!form.checkValidity()) {
            event.stopPropagation()
        }

        // if ((this.state.latitude <= 0) || (this.state.longitude.length <= 0)) {
        //     document.querySelector("#locButton").classList.add('is-invalid');
        //     form.classList.add('was-validated')
        //     return
        // }
        form.classList.add('was-validated')

        this.handleShow()
        // alert('A product was submitted: ' + this.state.title)
        let formData = new FormData();
        console.log(this.state.media)

        formData.append('title', this.state.title)
        console.log(formData)
        formData.append('description', this.state.description)
        console.log('negotiable', this.state.negotiable)
        formData.append('negotiable', this.state.negotiable)
        formData.append('showContact', this.state.showContact)
        formData.append('isPickedUp', this.state.isPickedUp)
        formData.append('price', this.state.price)
        for (const key of Object.keys(this.state.media)) {
            formData.append('media', this.state.media[key])
        }
        // formData.append('media', this.state.media)
        formData.append('tags', this.state.categories)
        formData.append('keyWords', this.state.keywords)
        formData.append('latitude', this.state.latitude)
        formData.append('longitude', this.state.longitude)
        // form.append('seller', this.props.token)
        formData.append('seller', this.userID)
        // form.append('_id', this.userID)
        console.log("test")
        axios.post(`${BACKEND_ADDR}/api/new-product`, formData, {}).then(res => {
            console.log(res.data)
            console.log(this.userID)
        }).catch(err => {
            console.log(err)
            this.setState({show: true})
            this.setState({resState: err.response.status})

            this.setState({
                errorMsg: err.response.data.map((x) => {
                    return x.msg
                })
            })
            console.log(this.userID)

        })
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
                // console.log(error.message)
                // this.setState({errorMsg : [error.message]})
                // this.handleShow()
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
                                                    <div
                                                        className="d-flex justify-content-between align-items-center mb-5">
                                                        <h1 className="fw-bold mb-0 text-black">Upload your product to
                                                            sell!</h1>
                                                    </div>

                                                    <form onSubmit={this.handleSubmit} className="needs-validation">
                                                        <div className="mb-3">
                                                            <button onClick={this.getUserCoordinates} type="button"
                                                                    className="btn btn-outline-secondary"
                                                                    id="locButton"
                                                                    aria-describedby="validationLocationFeedback">
                                                                Get my location
                                                            </button>
                                                            {/*<div className="invalid-feedback" id="validationLocationFeedback">*/}
                                                            {/*    Please share your location.*/}
                                                            {/*</div>*/}
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="form-label">Product Title:</label>

                                                            <input type="text" name="title" className="form-control"
                                                                   onChange={this.handleChangeTitle} maxLength={200}
                                                                   required/>
                                                            <div className="form-text">
                                                                The product's title should be less than 200 characters.
                                                            </div>
                                                        </div>
                                                        <label className="form-label">Price:</label>
                                                        <div className="input-group mb-3">
                                                            <span className="input-group-text">$</span>
                                                            <input type="number" className="form-control" name="price"
                                                                   step="0.01" min={'0'}
                                                                   onChange={this.handleChangePrice} required/>
                                                        </div>
                                                        {/*<label className="form-label">Click if the price is negotiable:</label>*/}
                                                        {/*<div className="input-group mb-3">*/}
                                                        {/*    <input type="checkbox" name="negotiable" onChange={this.handleChangeNegotiable} defaultChecked={this.state.negotiable} />*/}
                                                        {/*</div>*/}
                                                        <div className="mb-3">
                                                            <label className="form-label">
                                                                Is this price negotiable? *
                                                                <select className=" form-select form-select-lg mb-3"
                                                                        name="negotiable" id="negotiable"
                                                                        onChange={this.handleChangeNegotiable} required>
                                                                    <option selected value="true">Yes</option>
                                                                    <option value="false">No</option>
                                                                </select>
                                                            </label>
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="form-label">
                                                                Would you like to share your contact to buyers? *
                                                                <select className=" form-select form-select-lg mb-3"
                                                                        name="negotiable" id="negotiable"
                                                                        onChange={this.handleChangeShowContact}
                                                                        required>
                                                                    <option selected value="true">Yes</option>
                                                                    <option value="false">No</option>
                                                                </select>
                                                            </label>
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="form-label">
                                                                Is this product available for pickup? *
                                                                <select className=" form-select form-select-lg mb-3"
                                                                        name="negotiable" id="negotiable"
                                                                        onChange={this.handleChangePickup} required>
                                                                    <option value="true">Yes</option>
                                                                    <option selected value="false">No</option>
                                                                </select>
                                                                <div className="form-text">
                                                                    Your product is set to available for delivery by default
                                                                </div>
                                                            </label>
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="form-label">Description * :</label>
                                                            <textarea className="form-control form-text"
                                                                      name="description"
                                                                      onChange={this.handleChangeDescription} rows="3"
                                                                      required maxLength={200}/>
                                                            <div className="form-text">
                                                                Your description should be less than 200 characters.
                                                            </div>
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="">Upload images * :</label>
                                                            <input type="file" className="form-control" name="media"
                                                                   accept="image/*"
                                                                   onChange={this.handleChangeMedia} multiple
                                                                   id="formFileMultiple"
                                                                   required/>
                                                        </div>
                                                        {/*send images to backend then backend send images to hosting storage*/}
                                                        <div className="mb-3">
                                                            <label className="form-label">
                                                                Select your product categories:
                                                                <select className=" form-select form-select-lg mb-3"
                                                                        name="categories" id="categories"
                                                                        multiple={true}
                                                                        onChange={this.handleChangeCategories} required>
                                                                    <option value="furniture">Furniture</option>
                                                                    <option value="book">Book</option>
                                                                    <option value="cookware & tableware">Cookware &
                                                                        Tableware
                                                                    </option>
                                                                    <option value="children & nursery">Children &
                                                                        Nursery
                                                                    </option>
                                                                    <option value="storage & organization">Storage &
                                                                        Organization
                                                                    </option>
                                                                    <option value="any">Other</option>
                                                                </select>
                                                            </label>
                                                        </div>

                                                        {/*freestyle tags*/}
                                                        <div className="mb-3">
                                                            <label className="form-label">What else tags would you like
                                                                to add (max 20 characters per tag):</label>
                                                            <Autocomplete
                                                                onChange={this.handleChangeTags}
                                                                multiple
                                                                id="free-tags"
                                                                // options={freeTagOptions.map(option=>option.title)}
                                                                options={freeTagOptions}
                                                                // getOptionLabel={option}
                                                                filterSelectedOptions
                                                                freeSolo
                                                                renderTags={(value, getTagProps) => value.map((option, index) => (
                                                                    <Chip variant="filled"
                                                                          label={option} {...getTagProps({index})} />
                                                                ))}
                                                                renderInput={(params) => (
                                                                    <TextField {...params} variant="filled"
                                                                               label="freestyle tags"
                                                                               placeholder="#tags"/>
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
                                                    {/*{this.state.resState === 401 ?*/}
                                                    {/*    <Modal.Body>401 Unauthorized: You are not a seller*/}
                                                    {/*        yet</Modal.Body> : this.state.resState === 400 ?*/}
                                                    {/*        <Modal.Body> Error <br/>*/}
                                                    {/*            {this.state.errorMsg[0]} </Modal.Body>*/}
                                                    {/*        : this.state.resState === '' ?*/}
                                                    {/*            <Modal.Body> Error <br/>*/}
                                                    {/*                {this.state.errorMsg} </Modal.Body> :*/}
                                                            <Modal.Body>Woohoo, you have submitted a
                                                                product {this.state.title}!
                                                            Note: Product is set to available for delivery by default
                                                            </Modal.Body>
                                                    {/*}*/}
                                                    <Modal.Footer>

                                                        <Button variant="primary" data-bs-dismiss="modal" onClick={() => {
                                                            this.handleClose()
                                                            //this.setState({errorMsg : ''})
                                                            // if (this.state.resState !=='' && this.state.resState !== 400 && this.state.resState !== 401){
                                                            //     window.location.href = "/"
                                                            // }
                                                            console.log(this.state.resState)
                                                            
                                                            window.location.href = "/"

                                                        }
                                                        }>
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

export default NewProduct;
