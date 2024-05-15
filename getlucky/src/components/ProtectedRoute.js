import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ userAddress, children }) => {
  if (!userAddress) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
