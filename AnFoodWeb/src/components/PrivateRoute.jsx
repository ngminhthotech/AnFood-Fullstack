import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ user, requiredRole }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.vaiTro !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // 👇 QUAN TRỌNG: Phải có dòng này mới hiện nội dung con!
  return <Outlet />;
};

export default PrivateRoute;