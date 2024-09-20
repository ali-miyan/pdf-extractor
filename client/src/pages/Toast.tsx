import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const notifySuccess = (message: string) => toast.success(message);

const notifyError = (message: string) => toast.error(message);
const Toast: React.FC = () => {

  return (
    <ToastContainer
      position="top-center"
      autoClose={3000} 
      hideProgressBar
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  );
};

export { Toast, notifySuccess, notifyError };
