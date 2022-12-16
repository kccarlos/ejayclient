import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import PropTypes from 'prop-types';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import DialogContentText from '@mui/material/DialogContentText';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { blue } from '@mui/material/colors';
import { getLocalStorage } from "../../utils/localStorage";
import { useEffect } from "react";
import { CircularProgress } from "@mui/material";
import FilterListIcon from '@mui/icons-material/FilterList';
import { visuallyHidden } from '@mui/utils';
import { alpha } from '@mui/material/styles';
import { getDistance } from 'geolib';


import EditIcon from '@mui/icons-material/Edit';
// import ProgressiveImg from "./ProgressiveImg.png";
import { BACKEND_ADDR } from "../const";
import PopInfo from "./PopInfo";


import ApprovalIcon from '@mui/icons-material/Approval';
import VerifiedIcon from '@mui/icons-material/Verified';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CachedIcon from '@mui/icons-material/Cached';

function createCoordinate(x, y) {
  return {
    latitude: x,
    longitude: y
  };
}

function createData(username, price, distance, rating, bio, avatarURL, _id) {
  return {
    username,
    price: price,
    rating: rating ? rating : "N/A",
    distance: distance,
    bio,
    avatarURL,
    _id,
  };
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: '',
    numeric: false,
    disablePadding: true,
    label: '',
  },
  {
    id: 'name',
    numeric: false,
    disablePadding: false,
    label: 'User',
  },
  {
    id: 'price',
    numeric: true,
    disablePadding: true,
    label: 'Price($)',
  },
  {
    id: 'rating',
    numeric: true,
    disablePadding: true,
    label: 'Rating',
  },
  {
    id: 'distance',
    numeric: true,
    disablePadding: true,
    label: 'Distance(miles)',
  },

];

function EnhancedTableHead(props) {
  const { order, orderBy, numSelected, rowCount, onRequestSort } =
    props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};


const BuyerDialog = (props) => {

  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('price');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const { onClose, selectedValue, open } = props;
  const [price, setPrice] = useState(props.product.price);
  const potentialBuyers = props.potentialBuyers;
  const potentialBuyersAddresses = props.potentialBuyersAddresses;
  const [emails, setEmails] = useState([]);
  const [rows, setRows] = useState([]);
  const [buyerCount, setBuyerCount] = useState(0);
  const productLocation = createCoordinate(props.product.location[0], props.product.location[1]);
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value) => {
    onClose(value);
  };


  async function getBuyerRating(userID) {
    const response = await fetch(`${BACKEND_ADDR}/api/getRating?userID=${userID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": getLocalStorage('token'),
      },
    });
    if (!response.ok) {
      return;
    }

    const rating = await response.json();
    return parseInt(rating.buyerRating);
  }

  async function getBuyerInfo(buyerID) {
    const buyerRating = await getBuyerRating(buyerID);
    const response = await fetch(`${BACKEND_ADDR}/api/getUserPublic/${buyerID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // body: JSON.stringify({buyer: buyerID})
    });
    if (!response.ok) {
      return;
    }
    const buyerEmail = await response.json();
    let updatedEmail = [...emails];
    // updatedEmail[buyerID] = buyerEmail;
    const newEmail = {
      _id: buyerID,
      email: buyerEmail.email,
      avatarURL: buyerEmail.avatarURL,
      username: buyerEmail.username,
      buyerRating: buyerRating ? buyerRating : "N/A",
      bio: buyerEmail.bio,
    };

    for (let i = 0; i < emails?.length; i++) {
      if (emails[i]._id === buyerID) {
        return;
      }
    }
    
    updatedEmail.push(newEmail);
    setEmails(updatedEmail);
    setRows(
      updatedEmail.map((info, index) => createData(
        info.username,
        potentialBuyersAddresses && potentialBuyersAddresses[index] ? potentialBuyersAddresses[index].totalPrice : price,
        potentialBuyersAddresses && potentialBuyersAddresses[index] ? getDistance(productLocation, createCoordinate(potentialBuyersAddresses[index].latitude, potentialBuyersAddresses[index].longtitude)) * 0.00062 : 'N/A',
        info.buyerRating,
        info.bio,
        info.avatarURL,
        info._id))
    );
    setBuyerCount(updatedEmail.length);
  
    return;
  }

  useEffect(() => {
    if (buyerCount < potentialBuyers.length) {
      getBuyerInfo(potentialBuyers[buyerCount]);
    }
  } , [buyerCount, potentialBuyers]);


  const showList = useMemo(() => {

    const emptyRows =
      page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;
    if (rows.length === potentialBuyers.length) {
      return (
        <Box sx={{ width: '100%' }}>
          <Paper sx={{ width: '100%' }}>
            <TableContainer>
              <Table
                // sx={{ minWidth: 750 }}
                aria-labelledby="tableTitle"
              >
                <EnhancedTableHead

                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                  rowCount={rows.length}
                />
                <TableBody>
                  {/* if you don't need to support IE11, you can replace the `stableSort` call with:
                 rows.sort(getComparator(order, orderBy)).slice() */}
                  {stableSort(rows, getComparator(order, orderBy))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
                      const labelId = `enhanced-table-checkbox-${index}`;
                      return (
                        <TableRow
                          hover
                          tabIndex={-1}
                          key={row.username}
                        >
                          <TableCell align="right"><button className="btn btn-outline-secondary btn-sm" onClick={() => handleListItemClick(row.username)}>select</button></TableCell>
                          <TableCell
                            component="th"
                            id={labelId}
                            scope="row"
                            padding="none"
                          >
                            <ListItem key={row._id}>
                              <ListItemAvatar>
                                <Avatar src={row.avatarURL} />
                              </ListItemAvatar>
                              <ListItemText
                                primary={<Link style={{ textDecoration: 'none', color: "black" }} to={`/user-page/${row._id}`} >{row.username}</Link>}
                                secondary={
                                  <React.Fragment>
                                    <Typography
                                      sx={{ display: 'inline' }}
                                      component="span"
                                      variant="body2"
                                      color="text.primary"
                                    >
                                    </Typography>
                                    {/* {row.bio.split().length > 10? row.bio.split().slice(0, 10).join() + "... ": row.bio} */}
                                  </React.Fragment>
                                }
                              />
                            </ListItem>
                          </TableCell>
                          <TableCell align="right">{row.price ? row.price : price}</TableCell>
                          <TableCell align="right">{row.rating !== "N/A" ? row.rating + ' / 5' : 'N/A'}</TableCell>
                          <TableCell align="right">{row.distance !== "N/A" ? row.distance : 'N/A'}</TableCell>
                        </TableRow>
                      );
                    })}
                  {emptyRows > 0 && (
                    <TableRow
                      style={{
                        height: (53) * emptyRows,
                      }}
                    >
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Box>
      );
    } else {
      return <CircularProgress />
    }

  }, [order, orderBy, page, potentialBuyers, rows, rowsPerPage]);


  return (
    <Dialog onClose={handleClose} open={open} fullWidth >

      <div className="modal-content" style={{ margin: 0, padding: '20px 0px' }}>
        <div className="close-modal" data-bs-dismiss="modal"></div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-12">
              <div className="modal-body">
                <h2 className="text-uppercase">Who are interested in you products:</h2>
                <p className="item-intro text-muted">After select and approve your buyer, you cannot re-select.</p>
                <ul className="list-inline">
                  <li>
                    <strong>Product: </strong>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar src={props.product.image} variant="rounded" />
                      </ListItemAvatar>
                      <ListItemText
                        primary={props.product.title}
                      />
                    </ListItem>
                  </li>
                  <li>
                    <strong>Your original price: </strong>
                    <AttachMoneyOutlinedIcon style={{ marginRight: -5, marginTop: -3 }} />
                    {props.product.price}
                  </li>
                </ul>
                {showList}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

const AlertDialog = (props) => {
  const [open, setOpen] = React.useState(false);

  const buyerUsername = props.buyer;
  const productId = props.productId;

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleApprove = async () => {
    const approve = {
      productId,
      buyerUsername
    };
    console.log(approve);
    const response = await fetch(`${BACKEND_ADDR}/api/approveOrder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": getLocalStorage("token")
      },
      body: JSON.stringify(approve),
    });
    if (!response.ok) {
      window.alert(`Error approving order: ${response.statusText}`);
      return;
    }

    setOpen(false);
    props.updateStatus("approved");

    // send notification to buyer
    const response2 = await fetch(`${BACKEND_ADDR}/api/sendEmailBuyer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": getLocalStorage("token")
      },
      body: JSON.stringify(approve),
    });

  };

  return (
    <div>
      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleClickOpen}>Approve</button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {`Are you sure to make the transaction`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            After approval, you should contact the buyer to start the offline transaction. Attention: you cannot reselect your buyer once approve the transaction!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleApprove} autoFocus>
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

const DeleteDialog = (props) => {
  const [open, setOpen] = React.useState(false);
  const [product, setProduct] = React.useState(props.product);
  const getStatus = props.getStatus;

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = (e) => {
    handleClose();
    e.preventDefault();
    getStatus('deleted');
    const updatedProduct = { ...product, status: 'deleted' };
    setProduct(updatedProduct);
    sendForm(updatedProduct);
  };

  const sendForm = async (updatedProduct) => {
    const response = await fetch(`${BACKEND_ADDR}/api/updateProduct`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": getLocalStorage('token'),
      },
      body: JSON.stringify(updatedProduct),
    });
    if (!response.ok) {
      window.alert(`Error: ${response.statusText}`);
    }
  };


  return (
    <div width="20px">
      <button type="button" className="btn" onClick={handleClickOpen} aria-label="delete"><DeleteIcon /></button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {`Are you sure to delete the item`}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDelete} autoFocus >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

const MiniList = (props) => {
  const [operation, setOperation] = useState(0);
  const product = props.product;
  const imageUrl = product.image;
  const title = product.title;
  const price = product.price;
  const [buyer, setBuyer] = useState(product.buyer);
  const productId = product._id;
  const [status, setStatus] = useState(product.status);
  const [potentialBuyers, setBuyers] = useState(product.potentialBuyers)
  const [potentialBuyersAddresses, setBuyersAddresses] = useState(product.potentialBuyersAddresses);
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState("");
  const [rating, setRating] = useState(0);

  async function getRating() {
    const response = await fetch(`${BACKEND_ADDR}/api/getOneRating?productID=${props.product._id}`, {
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
    if (res == null) {
      setRating(0);
    } else {
      setRating(parseInt(res.rating));
    }

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
        productID: props.product._id,
        ratingNumber: newRating,
      })
    });
    if (!response.ok) {
      return;
    }
    return;
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
    setSelectedValue(value);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
  }

  const getStatus = (val) => {
    setStatus(val);
  };

  useEffect(() => {
    if (status === 'approved') {
      getRating()
    }
  }, [status]);

  const ratings = useMemo(() => {
    return (
      <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
        <div > Your rating <PopInfo /> on the buyer: </div>
        <Rating name="half-rating" value={rating} precision={0.5} onChange={(event, newValue) => {
          updateRating(newValue);
        }} />
      </Stack>
    );
  }, [rating]);

  return (
    <div style={{display:'flex', alignItems:'center', width: '100%'}}>
      <div style={{flexGrow: 0.3}} >
      {status !== 'deleted' ? (
        <Link className="fw-bolder" to={`/product/${productId}`}>
          <img src={imageUrl} alt="Item image" style={{ width: 200 }}/>
        </Link>) : (
        <img src={imageUrl} alt="Item image" style={{ width: 200 }}/>
      )}
      </div>
      <div className="card-body p-4"  >
        {status !== 'deleted' &&
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <DeleteDialog product={product} getStatus={getStatus} />
            <button color="action" display="inline" type="button" className="btn" width="20px" aria-label="edit">
              <Link to={`/update-product/${productId}`}>
                <EditIcon />
              </Link>
            </button>
          </div>}
        <div className="text-center">
            <p className="fw-bolder">{title}</p>
            ${price}
            <div style={{display:'flex', flexDirection:'row', justifyContent:'center'}} >
              {status === 'approved' ? <ApprovalIcon/>  :
              status === 'completed' ? <VerifiedIcon sx={{ color: "green" }}/> : 
              status === 'deleted' ? <DeleteForeverIcon/> :
              status === 'pending' ? <HourglassTopIcon/> :
              status === 'selling' ? <StorefrontIcon/> :
              status === 'inProgress' ? <CachedIcon/> :""} 
              <p>status: {status}</p>
            </div>
        </div>
        <div className="btncontainer" style={{ paddingTop: 20 }}>
        </div>
        {status !== 'deleted' && status !== 'approved' && status !== 'completed' && (<div className="text-center">
          {potentialBuyers.length !== 0 ? (
            <div>
              <p className="fw-bolder">Congrats! Someone interests in your product! </p>
              <div>
                <br />
                <BuyerDialog
                  selectedValue={selectedValue}
                  potentialBuyers={potentialBuyers}
                  potentialBuyersAddresses={potentialBuyersAddresses}
                  product={product}
                  open={open}
                  onClose={handleClose}
                />
                <Typography variant="subtitle1" component="div">
                  Approve the Transaction with: {selectedValue}
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleClickOpen}>Select</button>
                  <AlertDialog buyer={selectedValue} productId={productId} updateStatus={handleStatusChange} />
                </Typography>
              </div>
            </div>
          ) : (
            <p className="fw-bolder">No one shows interest yet</p>
          )}
        </div>)}
        {status === 'approved' && ratings}
      </div>
    </div>
  );
};

export default MiniList;
