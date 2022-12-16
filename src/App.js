import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useNavigate,
  Link,
} from "react-router-dom";
// import "./App.css";
import RegisterPage from "./pages/RegisterPage";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import LogoutPage from "./pages/LogoutPage";
import UserPage from "./pages/UserPage";
import NewProduct from "./pages/NewProduct";
import DetailPage from "./pages/DetailPage";
import OrderPage from "./pages/OrderPage";
import Favorites from "./pages/Favorites";
import VerifyEmail from "./pages/VerifyEmail";

import 'bootstrap/dist/css/bootstrap.css';
import {setLocalStorage, getLocalStorage} from "./utils/localStorage";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import PublicUserPage from "./pages/PublicUserPage";
import PendingPage from "./pages/PendingPage";
import UpdateProduct from "./pages/UpdateProduct";
// import { ReactComponent as BrandSvg } from "../public/eJayBrand.svg";

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  function handleToken(t) {
    setToken(t);
    setLocalStorage('token', t);
  }
  // Read localstorage's token
  useEffect(() => {
      const token = getLocalStorage('token');
      if (token) {
          setToken(token);
      }
  },[])

  return (
    <div id="page-top">
      <BrowserRouter>
          {getLocalStorage('token')? (
            // <nav className="navbar navbar-expand-lg navbar-dark fixed-top" id="mainNav">
            //     <div className="container">
            //         <a className="navbar-brand" href="/"><img src="/Logo.svg" width="50" height="50" alt="eJay Logo" /></a>
            //         <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
            //             Menu
            //             <i className="fas fa-bars ms-1"></i>
            //         </button>
            //         <div className="collapse navbar-collapse" id="navbarResponsive">
            //             <ul className="navbar-nav text-uppercase ms-auto py-4 py-lg-0">
            //                 <li className="nav-item"><a className="nav-link" href="#services">Services</a></li>
            //                 <li className="nav-item"><a className="nav-link" href="#portfolio">Portfolio</a></li>
            //                 <li className="nav-item"><a className="nav-link" href="#about">About</a></li>
            //                 <li className="nav-item"><a className="nav-link" href="#team">Team</a></li>
            //                 <li className="nav-item"><a className="nav-link" href="#contact">Contact</a></li>
            //             </ul>
            //         </div>
            //     </div>
            // </nav>
              <Navbar className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top" expand="lg" style={{position: 'relative'}}>
                  <Container>
                      <Navbar.Brand className="navbar-brand" as={Link} to="/">
                          <img
                              src="/Logo.svg"
                              width="50"
                              height="50"
                              className="d-inline-block align-top"
                              alt="eJay Logo"
                          />
                      </Navbar.Brand>
                      <Navbar.Toggle className="navbar-toggler" aria-controls="basic-navbar-nav" />
                      <Navbar.Collapse id="basic-navbar-nav">
                          <Nav className="me-auto">
                              <Nav.Link className="nav-link" as={Link} to="/">Home</Nav.Link>
                              <Nav.Link className="nav-link" as={Link} to="/orders">Orders</Nav.Link>
                              <Nav.Link className="nav-link" as={Link} to="/favorites">Favorites</Nav.Link>
                              <Nav.Link className="nav-link" as={Link} to="/user">Account</Nav.Link>
                              <Nav.Link className="nav-link" as={Link} to="/logout">Logout</Nav.Link>
                          </Nav>
                      </Navbar.Collapse>
                  </Container>
              </Navbar>
          ) : (
              <Navbar className="navbar bg-dark navbar-expand-lg navbar-dark fixed-top" expand="lg" style={{position: 'relative'}}>
                  <Container>
                      <Navbar.Brand as={Link} to="/">
                          <img
                              src="/Logo.svg"
                              width="50"
                              height="50"
                              className="d-inline-block align-top"
                              alt="eJay Logo"
                          />
                      </Navbar.Brand>
                      <Navbar.Toggle aria-controls="basic-navbar-nav" />
                      <Navbar.Collapse id="basic-navbar-nav">
                          <Nav className="me-auto">
                              <Nav.Link as={Link} to="/">Home</Nav.Link>
                              <Nav.Link as={Link} to="/login">Login</Nav.Link>
                          </Nav>
                      </Navbar.Collapse>
                  </Container>
              </Navbar>
          )}
        {/* <header className="bg-dark py-5">
            <div className="container px-4 px-lg-5 my-5">
                <div className="imgBox" style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
                    <img src="/eJayBrand.svg" alt="abc" height="auto" width="60%" id="image-section"/>
                </div>
            </div>

        </header> */}
        <Routes >
          <Route path="/" element={<MainPage />} />
          <Route path="user/" element={<UserPage token={token} />} />
          <Route path="orders/" element={<OrderPage token={token} />} />
          <Route path="favorites/" element={<Favorites token={token} />} />
          <Route
            path="login"
            element={<LoginPage onToken={(t) => handleToken(t)} />}
          />
          <Route
            path="logout"
            element={<LogoutPage onToken={(t) => handleToken(t)} />}
          />
          <Route path="register" element={<RegisterPage />} />
          <Route path="product/:id" element={<DetailPage token={token}/>} />
          <Route path="update-product/:id" element={<UpdateProduct token={token}/>} />
          <Route path="new-product/:user_id" element={<NewProduct />}  />
          <Route path="user-page/:user_id" element={<PublicUserPage /> } />
          <Route path="verifyemail/:id" element={<VerifyEmail /> } />
          <Route path="pending" element={<PendingPage /> } />
          {/* <Route path="/*" element={<NotFound />} /> */}

        </Routes>
      </BrowserRouter>
      <footer className="py-5 bg-dark">
          <div className="container"><p className="m-0 text-center text-white">Copyright &copy; eJay 2022</p></div>
      </footer>
    </div>
  );
}

export default App;
