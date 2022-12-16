import React, {useState, useEffect, useMemo} from "react";

import Box from '@mui/material/Box';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Link } from "react-router-dom";
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SellIcon from '@mui/icons-material/Sell';
import { BACKEND_ADDR } from "../const";

function Post(props) {
    var moment = require('moment');
    moment().format();

    const [seller, setSeller] = useState({});

    async function getBuyerInfo(sellerID) {
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
        // updatedEmail[buyerID] = buyerEmail;
        const updatedSeller = {
          _id : sellerID,
          email: seller.email,
          avatarURL: seller.avatarURL,
          username: seller.username
        };
        setSeller(updatedSeller);
        return;
      }

    const sellerInfo = useMemo(() => {
        return (
            <CardHeader
                avatar={
                <Link to={props.sellerLink} style={{ textDecoration: 'none' }}>
                    <Avatar aria-label="recipe" src={seller.avatarURL} />
                </Link>
                }
                // action={
                // <IconButton aria-label="settings">
                //     <MoreVertIcon />
                // </IconButton>
                // }
                title={
                    <Link to={props.sellerLink} style={{ textDecoration: 'none' }}>
                    {seller.username}
                    </Link>
                }
                subheader = {moment(props.create_time).fromNow()}
            />
        );
    }, [seller]);

    useEffect(() => {
        if (props.sellerID !== undefined) {
            getBuyerInfo(props.sellerID)
        }
        
    }, [props.sellerID]);

    return (
        <div className="col-lg-3 col-sm-6 mb-4 mb-sm-0" style={{paddingBottom:"10px", paddingTop:"5px"}}>
            <div className="portfolio-item">
                <div className="portfolio-caption">
                  <div className="portfolio-caption">{sellerInfo}</div>
                </div>
                <div className="portfolio-hover">
                    <div className="portfolio-hover-content"><i className="fas fa-plus fa-3x"></i></div>
                </div>
                <div className="portfolio-img-container">
                    <img className="img-fluid" src={props.imgURL} alt="..." />
                    <div class="portfolio-middle">
                        <Link className="portfolio-link btn btn-lg" data-bs-toggle="modal" to={props.productLink}>
                            <div class="text">View Details</div>   
                        </Link>
                    </div>
                </div>
                <div className="portfolio-caption">
                    <div className="portfolio-heading">{props.title}</div>        
                </div>
                <div className="portfolio-caption">
                    <h5 className="portfolio-heading">
                        <SellIcon /> USD {props.price}</h5>
                        </div>
            </div>
        </div>
        
    );
}

export default Post;