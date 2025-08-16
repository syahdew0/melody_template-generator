import axios from 'axios';
// export const API_URL = 'https://api-interuma.pasifiksgroup.com:8443'
// export const API_URL = 'http://localhost:3001'
// export const API_URL = process.env.VUE_APP_API_URL;
// export const API_URL = 'compro.pasifiksgroup.com:8443'
export const API_URL = process.env.VUE_APP_API_URL;



export const API_ENDPOINTS = {
  mediaList: `${API_URL}/api/media`,
  mediaUpload: `${API_URL}/api/media`,
  mediaDelete: `${API_URL}/api/media`,

  newsletterSettings: `${API_URL}/api/admin/newsletter-settings`,
  newsletterSubscribers: `${API_URL}/api/admin/newsletter-subscribers`,

  menuList: `${API_URL}/api/admin/menus`,
  menuCreate: `${API_URL}/api/admin/menus`,
  menuUpdate: (id) => `${API_URL}/api/admin/menus/${id}`,
  menuDelete: (id) => `${API_URL}/api/admin/menus/${id}`,
  settingLogo: `${API_URL}/api/setting-logo`,

  ctaAdmin: `${API_URL}/api/admin/cta`,
  cta: `${API_URL}/api/cta`,

  auth: {
    ping: `${API_URL}/api/auth/ping`, 
    login: `${API_URL}/api/auth/login`,
    register: `${API_URL}/api/auth/register`,
    forgotPassword: `${API_URL}/api/auth/forgot-password`,
    resetPassword: `${API_URL}/api/auth/reset-password`,
  },

  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },

  users: `${API_URL}/api/admin/users`,
  profile: `${API_URL}/user/profile`,
  userById: (id) => `${API_URL}/api/admin/users/${id}`,
  makeAdmin: (id) => `${API_URL}/api/admin/users/make-admin/${id}`,
  updateUser: (id) => `${API_URL}/api/admin/users/${id}`,
  deleteUser: (id) => `${API_URL}/api/admin/users/${id}`,
  authMe: `${API_URL}/api/auth/me`,

  // === POSTS & CATEGORIES ADMIN ===
   // posts: `${API_URL}/apis/admin/posts`,               
  // postBySlug: (slug) => `${API_URL}/apis/posts/slug/${slug}`,  
  // UPDATE_POST_BY_SLUG: (slug) => `/apis/admin/posts/slug/${slug}`,
  // categories: `${API_URL}/apis/categories`,  
  
  posts: `${API_URL}/api/admin/posts`,
  postBySlug: (slug) => `${API_URL}/api/admin/posts/slug/${slug}`,
  UPDATE_POST_BY_SLUG: (slug) => `${API_URL}/api/admin/posts/slug/${slug}`,
  categories: `${API_URL}/api/admin/categories`,

  pages: `${API_URL}/api/admin/posts`,
  pageBySlug: (slug) => `${API_URL}/api/admin/posts/page/${slug}`,
  customPages: `${API_URL}/api/admin/custom-pages`,

  activeTheme: (websiteId) => `${API_URL}/api/admin/themes/${websiteId}/active-theme`,
  updateTheme: (id) => `${API_URL}/api/admin/themes/${id}`,
  themes: `${API_URL}/api/admin/themes`,
  setActiveTheme: (id) => `${API_URL}/api/admin/themes/${id}/active`,

  websiteSchema: (websiteId) => `${API_URL}/api/admin/themes/${websiteId}/active-theme`,
  deleteByTag: (tag) => `${API_URL}/api/custom-pages/deleteByTag/${encodeURIComponent(tag)}`,

  testimonials: `${API_URL}/api/admin/posts?type=testimonial`,
  testimonialDetail: (id) => `${API_URL}/api/admin/posts/${id}`,

  MENU_GROUPS: `${API_URL}/api/menu-groups`,
  ASSIGN_MENU: (id) => `${API_URL}/api/menu-groups/${id}/assign`,
  UNASSIGN_MENU: (id) => `${API_URL}/api/menu-groups/${id}/unassign`,
  MENU_GROUP_DETAIL: (id) => `${API_URL}/api/admin/menu-groups/${id}`,
  MENU_ITEMS: (groupId) => `${API_URL}/api/admin/menu-items?groupId=${groupId}`,
  CREATE_MENU_ITEM: `${API_URL}/api/admin/menu-items`,
  UPDATE_MENU_ITEM: (id) => `${API_URL}/api/admin/menu-items/${id}`,
  DELETE_MENU_ITEM: (id) => `${API_URL}/api/admin/menu-items/${id}`,
  CREATE_MENU_GROUP: `${API_URL}/api/menu-groups`,
  UPDATE_MENU_GROUP: (id) => `${API_URL}/api/menu-groups/${id}`,
  DELETE_MENU_GROUP: (id) => `${API_URL}/api/menu-groups/${id}`,   

  siteSettings: (id) => `${API_URL}/api/admin/websites/${id}/settings`,
  favicon: `${API_URL}/api/icons/favicon`,        
  icons: `${API_URL}/api/icons/upload`,           
  saveFavicon: `${API_URL}/api/icons/save`,      

  // Transaksi
  topup: {
    list: `${API_URL}/api/transaksi/topup`,
    bulkUpdateStatus: () => `${API_URL}/api/transaksi/topup/bulk-update-status`,
    byId: (id) => `${API_URL}/api/transaksi/topup/${id}`,
    summary: `${API_URL}/api/transaksi/topup-summary`,
  },

  withdraw: {
    list: (status = '', username = '') => {
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      if (username) params.append('username', username)
      return `${API_URL}/api/transaksi/withdraw?${params.toString()}`}
    ,
    updateStatus: (id) => `${API_URL}/api/transaksi/withdraw/${id}/status`,
    bulkUpdateStatus: () => `${API_URL}/api/transaksi/withdraw/bulk-update-status`,
  },

  adjust: {
    create: `${API_URL}/api/transaksi/adjust`,
    list: `${API_URL}/api/transaksi/adjust`,
    summaryAdjust: `${API_URL}/api/transaksi/adjust-summary`,
  },

  walletMe: `${API_URL}/api/transaksi/me`, 
  adminWalletHistory: `${API_URL}/api/transaksi/wallet-histories`,
  company_banks: `${API_URL}/api/company-banks`,
  adminCustomersList: `${API_URL}/api/admin/customers`,
  customersList: `${API_URL}/customer/auth/user/customers`,
  banks: `${API_URL}/banks`,
}



const api = axios.create({
  baseURL: API_URL,
});

// Interceptor untuk request (inject token)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Interceptor untuk response (refresh token otomatis)
api.interceptors.response.use(response => {
  const refreshedToken = response.headers['x-refreshed-token'];
  if (refreshedToken) {
    localStorage.setItem('token', refreshedToken);
    console.log('[Axios] Token diperbarui otomatis.');
  }
  return response;
}, error => {
  if (error.response?.status === 401) {
    console.warn('[Axios] Token tidak valid. Logout...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export { api };
export default API_ENDPOINTS;