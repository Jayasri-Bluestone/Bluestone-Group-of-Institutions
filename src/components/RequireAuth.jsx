import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * RequireAuth - Protects routes that require a logged-in user.
 * It also handles the initial redirect from /portal to /portal/dashboard if already logged in.
 */
export const RequireAuth = ({ isAuthenticated, redirectTo = "/portal" }) => {
  const location = useLocation();
  
  if (!isAuthenticated) {
    // Redirect to login, but save the current location they were trying to go to
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

/**
 * RequireTier - Protects routes based on user tier/role.
 */
export const RequireTier = ({ user, allowedTiers, fallbackPath = "/portal/dashboard" }) => {
  const getTier = (u) => {
    if (u?.tier) return u.tier;
    const r = u?.role || '';
    if (['Main Admin', 'MD', 'GM', 'Super Admin'].includes(r)) return 'SUPER_ADMIN';
    if (['TL', 'Coordinator', 'Head', 'Admin'].includes(r)) return 'ADMIN';
    return 'STAFF';
  };

  const userTier = getTier(user);
  
  if (!allowedTiers.includes(userTier)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};

/**
 * RequireStaffWithMultipleDomains - Specific guard for BGILeads
 */
export const RequireStaffWithMultipleDomains = ({ user, fallbackPath = "/portal/dashboard" }) => {
  const getTier = (u) => {
    if (u?.tier) return u.tier;
    const r = u?.role || '';
    if (['Main Admin', 'MD', 'GM', 'Super Admin'].includes(r)) return 'SUPER_ADMIN';
    if (['TL', 'Coordinator', 'Head', 'Admin'].includes(r)) return 'ADMIN';
    return 'STAFF';
  };

  const tier = getTier(user);
  const domains = (user?.domain || '').split(',').filter(Boolean);
  
  // Allow if ADMIN/SUPER_ADMIN OR STAFF with multiple domains
  const hasAccess = tier === 'SUPER_ADMIN' || tier === 'ADMIN' || (tier === 'STAFF' && domains.length > 1);

  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};
