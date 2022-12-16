import React, {useState, useEffect, useMemo} from "react";
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import {styled} from '@mui/material/styles';
import {BACKEND_ADDR} from "../const";
import {getLocalStorage} from "../../utils/localStorage";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import PopInfo from "./PopInfo";
import {Link} from "react-router-dom";

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// import ProgressiveImg from "./ProgressiveImg.png";

const Item = styled(Paper)(({theme}) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));


export default function StepCard(props) {
    const ActiveCard = () => {
        const steps = ['Waiting for Approval', 'Transaction Approved', 'Completed'];
        const [rating, setRating] = useState(0);
        const [open, setOpen] = useState(false);

        const handleClick = () => {
            setOpen(true);
        };

        const handleClose = (event, reason) => {
            if (reason === 'clickaway') {
                return;
            }
            setOpen(false);
        };

        async function getRating() {

            const response = await fetch(`${BACKEND_ADDR}/api/getOneRating?productID=${props.order._id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": getLocalStorage('token'),
                },
            });
            if (!response.ok) {
                window.alert(`Error: ${response.statusText}`);
                return;
            }
            const res = await response.json();
            setRating(parseInt(res?.rating))
        }


        async function updateRating(newRating) {
            setRating(newRating);
            const response = await fetch(`${BACKEND_ADDR}/api/updateRating`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": getLocalStorage('token'),
                },
                body: JSON.stringify({
                    productID: props.order._id,
                    ratingNumber: newRating,
                })
            });
            if (!response.ok) {
                return;
            }
            setOpen(true);
            return;
        }

        const ratings = useMemo(() => {

            return (
                <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                    <div> Your rating <PopInfo/> on the seller:</div>
                    <Rating name="half-rating" value={rating} precision={0.5} onChange={(event, newValue) => {
                        updateRating(newValue);
                    }}/>

                </Stack>
            );
        }, [rating]);

        useEffect(() => {
            if (props.order.buyer !== undefined) {
                getRating();
            }
        }, []);

        return (
            <>  <Link to={`/product/${props.order._id}`}>
                <img style={{width: 100, height: 100}} src={props.order.image} alt={props.order.image}
                    // placeholder={ProgressiveImg}
                /></Link>
                <p></p>
                <p>Current Price: USD {props.order.price}</p>

                <Stepper activeStep={
                    props.order.status=="selling"?0:props.order.status=="completed"?2:1
                }>

                    {steps.map((label, index) => {
                        return (

                            <Step key={label}
                            >
                                <StepButton color="inherit">
                                    {label}
                                </StepButton>
                            </Step>
                        )

                    })}
                </Stepper>
                <div>
                    {
                        props.order.buyer === undefined ? (
                            <React.Fragment>
                                <Typography sx={{mt: 2, mb: 1}}>
                                    Please wait for the seller's approval.
                                </Typography>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <Typography sx={{mt: 2, mb: 1}}>
                                    {/* Please contact the seller to start the offline transaction. */}
                                </Typography>
                                {props.order.status==="completed" && ratings}
                                <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                                    <Alert onClose={handleClose} severity="success" sx={{width: '100%'}}>
                                        You've successfully rated your seller!
                                    </Alert>
                                </Snackbar>
                            </React.Fragment>
                        )
                    }
                </div>
            </>
        )
            ;
    }

    const DenyCard = () => {
        const steps = ['Waiting for Approval', 'Transaction Disapproved']
        return (
            <>
                <img style={{width: 100, height: 100}} src={props.order.image} alt={props.order.image}
                    // placeholder={ProgressiveImg}
                />
                <Stepper nonLinear activeStep={steps.map((label, index) => (
                    <Step key={label} completed={1}>
                        <StepButton color="inherit">
                            {label}
                        </StepButton>
                    </Step>
                ))}>

                </Stepper>
                <div>
                    {
                        <React.Fragment>
                            <Typography sx={{mt: 2, mb: 1}}>
                                The product might be already sold out.
                            </Typography>

                        </React.Fragment>
                    }
                </div>
            </>
        );

    }
    if (props.order.buyer !== undefined && props.userId !== props.order.buyer) {
        return (<DenyCard/>);
    }
    return <ActiveCard/>;

}
