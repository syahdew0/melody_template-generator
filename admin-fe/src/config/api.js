import axios from 'axios';
// export const API_URL = 'https://api-interuma.pasifiksgroup.com:8443'
// export const API_URL = 'http://localhost:3001'
// export const API_URL = process.env.VUE_APP_API_URL;
// export const API_URL = 'compro.pasifiksgroup.com:8443'
// export const API_URL = process.env.VUE_APP_API_URL;
export const API_URL = process.env.VUE_APP_API_URL;



export const API_ENDPOINTS = {
  //  siteInfo: () => `${API_URL}/apis/public/site-info`,
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
  
  posts: `${API_URL}/apis/admin/posts`,
  postBySlug: (slug) => `${API_URL}/apis/admin/posts/slug/${slug}`,
  UPDATE_POST_BY_SLUG: (slug) => `${API_URL}/api/admin/posts/slug/${slug}`,
  categories: `${API_URL}/apis/categories`, 

postTypes: `${API_URL}/apis/admin/posts/types`,


  getAllComments: `${API_URL}/apis/comments`, // list semua komentar, bisa filter type (post/product/blog)
  getCommentById: (id) => `${API_URL}/apis/comments/${id}`, // detail komentar
  updateCommentStatus: (id) => `${API_URL}/apis/comments/${id}/status`, // approve/reject komentar
  commentAutoApprove: `${API_URL}/apis/comments/settings/auto-approve`,
  // posts: `${API_URL}/api/admin/posts`,
  // postBySlug: (slug) => `${API_URL}/api/admin/posts/slug/${slug}`,
  // UPDATE_POST_BY_SLUG: (slug) => `${API_URL}/api/admin/posts/slug/${slug}`,
  // categories: `${API_URL}/api/admin/categories`,

  pages: `${API_URL}/api/admin/posts`,
  pageBySlug: (slug) => `${API_URL}/api/admin/pages/slug/${slug}`,
  customPages: `${API_URL}/api/admin/custom-pages`,
  customPagesExport: (page, themeId, tags = []) => {
    const query = new URLSearchParams();
    query.set('page', page);
    if (themeId) query.set('theme_id', themeId);
    if (Array.isArray(tags) && tags.length > 0) {
      query.set('tags', tags.join(','));
    }
    return `${API_URL}/api/admin/custom-pages/export?${query.toString()}`;
  },
  customPagesImport: `${API_URL}/api/admin/custom-pages/import`,
  manifestThemes: `${API_URL}/apis/public/themes/manifest`,
  activeTheme: (websiteId) => `${API_URL}/api/admin/themes/${websiteId}/active-theme`,
  updateTheme: (id) => `${API_URL}/api/admin/themes/${id}`,
  themes: `${API_URL}/api/admin/themes`,
  setActiveTheme: (id) => `${API_URL}/api/admin/themes/${id}/active`,

  websiteSchema: (websiteId) => `${API_URL}/api/admin/themes/${websiteId}/active-theme`,
  deleteByTag: (tag) => `${API_URL}/api/custom-pages/deleteByTag/${encodeURIComponent(tag)}`,

  testimonials: `${API_URL}/apis/admin/posts?type=testimonial`,
  testimonialDetail: (id) => `${API_URL}/apis/admin/posts/${id}`,

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
  // favicon: `${API_URL}/apis/icons/favicon`,
  // icons: `${API_URL}/apis/icons/upload`,
  // saveFavicon: `${API_URL}/apis/icons/save`,     

  favicon: `${API_URL}/apis/icons/favicon`, // GET favicon
  uploadFavicon: `${API_URL}/apis/icons/upload`, // POST upload
  saveFavicon: `${API_URL}/apis/icons/save`, // POST save


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
  activate_company_bank: (id) => `${API_URL}/api/company-banks/${id}/activate`,
  deactivate_company_bank: (id) => `${API_URL}/api/company-banks/${id}/deactivate`,
  adminCustomersList: `${API_URL}/api/admin/customers`,
  customersList: `${API_URL}/customer/auth/user/customers`,
  banks: `${API_URL}/banks`,

 settingTopupWithdraw: `${API_URL}/api/admin/settings-transaksi`,

 orders: {
    list: `${API_URL}/api/admin/orders`,
    detail: (id) => `${API_URL}/api/admin/orders/${id}`,
    updateStatus: (id) => `${API_URL}/api/admin/orders/${id}/status`
  },

  roles: {
    list: `${API_URL}/api/admin/roles`, 
    create: `${API_URL}/api/admin/roles`, 
    detail: (id) => `${API_URL}/api/admin/roles/${id}`, 
    update: (id) => `${API_URL}/api/admin/roles/${id}`, 
    delete: (id) => `${API_URL}/api/admin/roles/${id}`,
  },

  modules: {
    list: `${API_URL}/api/admin/modules`,
    create: `${API_URL}/api/admin/modules`,
    detail: (id) => `${API_URL}/api/admin/modules/${id}`,
    update: (id) => `${API_URL}/api/admin/modules/${id}`,
    delete: (id) => `${API_URL}/api/admin/modules/${id}`,
  },
  userPermissions: `${API_URL}/api/admin/permissions`,

    mlmPackages: `${API_URL}/api/admin/mlm-packages`,
    mlmPackageById: (id) => `${API_URL}/api/admin/mlm-packages/${id}`,
    mlmSettings: `${API_URL}/api/admin/mlm-settings`,
    MLMTree: `${API_URL}/api/admin/mlm-tree`, 
    // adminWalletHistory: `${API_URL}/api/transaksi/wallet-histories`,
    mlmTransactions: `${API_URL}/api/transaksi/mlm-transactions`,
    mlmPaketUser: `${API_URL}/api/admin/paket-user`,
    mlmComplaints: `${API_URL}/api/admin/mlm-complaints`,

  productTypes: {
  list: `${API_URL}/api/admin/product-types`,
  create: `${API_URL}/api/admin/product-types`,
  update: (id) => `${API_URL}/api/admin/product-types/${id}`,
  delete: (id) => `${API_URL}/api/admin/product-types/${id}`,
},
productVariants: {
  list: (productId) => `${API_URL}/api/products/${productId}/variants`,
  create: (productId) => `${API_URL}/api/products/${productId}/variants`,
  createCombinations: (productId) => `${API_URL}/api/products/${productId}/variants/combinations`,
  update: (id) => `${API_URL}/api/variants/${id}`,
  delete: (id) => `${API_URL}/api/variants/${id}`,
},
brands: {
  list: `${API_URL}/apis/brands`,
  detail: (id) => `${API_URL}/apis/brands/id/${id}`,
  detailBySlug: (slug) => `${API_URL}/apis/brands/slug/${slug}`,
  create: `${API_URL}/apis/brands`,
  update: (id) => `${API_URL}/apis/brands/${id}`, 
  delete: (id) => `${API_URL}/apis/brands/${id}`,
},
listing: {
  list: `${API_URL}/apis/admin/listing`,
  create: `${API_URL}/apis/admin/listing`,
  detail: (post_id) => `${API_URL}/apis/admin/listing/${post_id}`,
  update: (post_id) => `${API_URL}/apis/admin/listing/${post_id}`,
  delete: (post_id) => `${API_URL}/apis/admin/listing/${post_id}`,

  // LISTING VALUES
  listValues: (post_id) => `${API_URL}/apis/admin/listing/${post_id}/values`,
},

listingType: {
  list: `${API_URL}/apis/admin/listing-type`,

},
 districts: `${API_URL}/apis/address/districts`,
  provinces: `${API_URL}/apis/address/provinces`,
  regencies: `${API_URL}/apis/address/regencies`,
  villages: `${API_URL}/apis/address/villages`,


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
