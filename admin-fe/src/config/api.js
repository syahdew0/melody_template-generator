// export const API_URL = 'https://api-interuma.pasifiksgroup.com:8443'
// export const API_URL = 'http://localhost:3001'
// export const API_URL = process.env.VUE_APP_API_URL;
// export const API_URL = 'compro.pasifiksgroup.com:8443'
export const API_URL = process.env.VUE_APP_API_URL;


export const API_ENDPOINTS = {
  // Value Section
  // valueSection: `${API_URL}/api/value-section`,
  // valueSectionDetail: (id) => `${API_URL}/api/value-section/${id}`,

  // Hero About (Admin & Public)
  // heroAbout: `${API_URL}/api/admin/hero-about`,
  // heroAboutDetail: (id) => `${API_URL}/api/admin/hero-about/${id}`,
  // heroAboutPublic: `${API_URL}/api/about-hero`,

  // teamHeader: `${API_URL}/api/team/header`,
  // teamMembers: `${API_URL}/api/team/members`,
  // teamMemberDetail: (id) => `${API_URL}/api/team/members/${id}`,
  // teamMemberPublic: `${API_URL}/api/our-team`,

  // visiMisi: `${API_URL}/api/visi-misi`,

  // aboutPreview: `${API_URL}/api/about-preview`,

  // heroHome: `${API_URL}/api/hero-home`,

  // whyChooseUs: `${API_URL}/api/why-choose-us`,
  // whyChooseUsHeader: `${API_URL}/api/why-choose-us/header`,
  // whyChooseUsBenefit: `${API_URL}/api/why-choose-us/benefit`,

  // portfolioPreview: `${API_URL}/api/portfolio-preview`,

  // portfolioHeader: `${API_URL}/api/portfolio/header`,
  // portfolioItems: `${API_URL}/api/portfolio/items`,

  // processSection: `${API_URL}/api/process-section`,
  // processSectionUpdate: `${API_URL}/api/process-section/admin/process-section`,

  // heroServices: `${API_URL}/api/hero-services`,

  // serviceSectionAdmin: `${API_URL}/api/admin/service-section`,
  // serviceSectionPublic: `${API_URL}/api/service-section`,

  // heroContact: `${API_URL}/api/contact-hero`,

  // contactInfo: `${API_URL}/api/contact-info`,
  // contactInfoAdmin: `${API_URL}/api/admin/contact-info`,

  // serviceList: `${API_URL}/api/service-list`,
  // adminServiceList: `${API_URL}/api/service-list`,

  // faqsSection: `${API_URL}/api/admin/faqs-section`,

  // mapsSection: `${API_URL}/api/maps-section`,

  // footerSettings: `${API_URL}/api/admin/footer`,
  // footerPublic: `${API_URL}/api/footer`,

  // contact form (message),
  // contactSettings: `${API_URL}/api/admin/contact-settings`,
  // contactMessages: `${API_URL}/api/admin/contact-messages`,
  // contactMessageDetail: (id) => `${API_URL}/api/admin/contact-messages/${id}`,
  // contactSubmit: `${API_URL}/api/contact-submit`,

  mediaList: `${API_URL}/api/media`,
  mediaUpload: `${API_URL}/api/media`,
  mediaDelete: `${API_URL}/api/media`,

  newsletterSettings: `${API_URL}/api/admin/newsletter-settings`,
  newsletterSubscribers: `${API_URL}/api/admin/newsletter-subscribers`,

  menuList: `${API_URL}/api/admin/menus`,
    menuCreate: `${API_URL}/api/admin/menus`,
    menuUpdate: (id) => `${API_URL}/api/admin/menus/${id}`,
    menuDelete: (id) => `${API_URL}/api/admin/menus/${id}`,          
    settingLogo: `${API_URL}/apis/setting-logo`,

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


  posts: `${API_URL}/api/admin/posts`,
  categories: `${API_URL}/api/categories`,
    pages: `${API_URL}/api/admin/posts`,
    customPages: `${API_URL}/api/admin/custom-pages`,
    activeTheme: (websiteId) => `${API_URL}/api/admin/themes/${websiteId}/active-theme`,
    updateTheme: (id) => `${API_URL}/api/admin/themes/${id}`,
    themes: `${API_URL}/api/admin/themes`,
    setActiveTheme: (id) => `${API_URL}/api/admin/themes/${id}/active`,
    websiteSchema: (websiteId) => `${API_URL}/api/admin/themes/${websiteId}/active-theme`,
    // deleteByTag: (tag) => `/custom_pages/deleteByTag/${tag}`,
    deleteByTag: (tag) => `${API_URL}/api/custom-pages/deleteByTag/${encodeURIComponent(tag)}`
  ,

    testimonials: `${API_URL}/api/admin/posts?type=testimonial`,
    testimonialDetail: (id) => `${API_URL}/api/admin/posts/${id}`,
 
    // menuGroups: `${API_URL}/api/menu-groups`,
    // menuItems: `${API_URL}/api/menu-items`,
    // menuItemsUpdate: id => `${API_URL}/api/menu-items/${id}`,
    // menuItemsDelete: `${API_URL}/api/menu-items`,
    // addMenuToGroup: `${API_URL}/api/menu-groups/assign`,
    // removeMenuFromGroup: `${API_URL}/api/menu-groups/unassign`,
    // groupedItems: `${API_URL}/api/menu-groups/items`,
      MENU_GROUPS: `${API_URL}/api/menu-groups`,
      ASSIGN_MENU: (id) => `${API_URL}/api/menu-groups/${id}/assign`,
      UNASSIGN_MENU: (id) => `${API_URL}/api/menu-groups/${id}/unassign`,
      MENU_GROUP_DETAIL: (id) => `${API_URL}/api/admin/menu-groups/${id}`,
      MENU_ITEMS: (groupId) => `${API_URL}/api/admin/menu-items?groupId=${groupId}`,
      CREATE_MENU_ITEM: `${API_URL}/api/admin/menu-items`,
      UPDATE_MENU_ITEM: (id) => `${API_URL}/api/admin/menu-items/${id}`,
      DELETE_MENU_ITEM: (id) => `${API_URL}/api/admin/menu-items/${id}`,


    siteSettings: (id) => `${API_URL}/api/admin/websites/${id}/settings`,
    favicon: `${API_URL}/apis/icons/favicon`,        
    icons: `${API_URL}/apis/icons/upload`,           
    saveFavicon: `${API_URL}/apis/icons/save`,       
}

export default API_ENDPOINTS
