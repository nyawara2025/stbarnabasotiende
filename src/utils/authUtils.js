// Authentication Utilities for Care Kenya Welfare App

/**
 * Check if user is admin
 */
export const isAdmin = () => {
  const user = localStorage.getItem('carekenya_welfare_current_user');
  if (!user) return false;
  
  try {
    const userData = JSON.parse(user);
    return userData.role === 'admin' || userData.role === 'treasurer' || userData.role === 'secretary';
  } catch (e) {
    return false;
  }
};

/**
 * Check if user is treasurer
 */
export const isTreasurer = () => {
  const user = localStorage.getItem('carekenya_welfare_current_user');
  if (!user) return false;
  
  try {
    const userData = JSON.parse(user);
    return userData.role === 'treasurer';
  } catch (e) {
    return false;
  }
};

/**
 * Check if user is secretary
 */
export const isSecretary = () => {
  const user = localStorage.getItem('carekenya_welfare_current_user');
  if (!user) return false;
  
  try {
    const userData = JSON.parse(user);
    return userData.role === 'secretary';
  } catch (e) {
    return false;
  }
};

/**
 * Check if user can create broadcasts
 */
export const canCreateBroadcast = () => {
  return isAdmin() || isSecretary();
};

/**
 * Check if user can manage finances
 */
export const canManageFinances = () => {
  return isAdmin() || isTreasurer();
};

/**
 * Get user role
 */
export const getUserRole = () => {
  const user = localStorage.getItem('carekenya_welfare_current_user');
  if (!user) return null;
  
  try {
    const userData = JSON.parse(user);
    return userData.role || 'member';
  } catch (e) {
    return 'member';
  }
};

export default {
  isAdmin,
  isTreasurer,
  isSecretary,
  canCreateBroadcast,
  canManageFinances,
  getUserRole,
};
