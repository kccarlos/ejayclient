// () => {return
//     <div className="">
//         <div>
//             <h2>Become a seller?</h2>
//             <Popup trigger={<Link>Click Here</Link>} modal nested>
//                 {(close) =>
//                     <div className="model" tabIndex="-1" aria-hidden="true">
//                         <div className="modal-dialog modal-dialog-centered">
//                             <div className="modal-content">
//                                 <div className="modal-body">
//                                     <h3>
//                                         Are you ready to become a seller ?{" "}
//                                     </h3>
//                                 </div>
//                                 <div className="modal-footer">
//                                     <button type="button"
//                                             className="btn btn-primary col-3"
//                                             onClick={() => {
//                                                 setUser({...user, isSeller: 1});
//                                                 sendForm();
//                                                 close();
//                                             }}
//                                     >Yes
//                                     </button>
//                                     <button type="button"
//                                             className="btn btn-primary col-3"
//                                             onClick={() => {
//                                                 close();
//                                             }}>Not yet
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//
//                 }
//             </Popup>
//         </div>
//     </div>
// }