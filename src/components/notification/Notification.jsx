import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for react-toastify
const Notification = () => {
    return (
        <div className="notification">
         <ToastContainer position='bottom-right'/>
        </div>
    );
};

export default Notification;