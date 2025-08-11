import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/views/LoginPage.vue'
import AdminDashboard from '@/components/AdminDashboard.vue'
import AdminUserManagement from '@/views/AdminUserManagement.vue'
import ProfileManagement from '@/views/ProfileManagement.vue'
// import PortfolioPage from '@/components/portfolio/PortfolioPage.vue'
// import OurTeam from '@/components/about/OurTeam.vue'
import MenuManager from '@/components/menu/MenuManager.vue'
// import AboutPreview from '@/components/home/AboutPreview.vue'
// import AboutHero from '@/components/about/AboutHero.vue'
// import AdminTestimonials from '@/components/home/AdminTestimonials.vue'
// import WhyChooseUsAdmin from '@/components/home/WhyChooseUsAdmin.vue'
// import AdminCTA from '@/components/AdminCTA.vue'
// import PortfolioPreview from '@/components/home/PortfolioPreview.vue'
// import HeroServices from '@/components/services/HeroServices.vue'
// import ServicesList from '@/components/services/ServicesList.vue'
// import ValueSection from '@/components/about/ValueSection.vue'
// import AdminProcessSection from '@/components/services/AdminProcessSection.vue'
// import AdminHeroHome from '@/components/home/AdminHeroHome.vue'
// import AdminFaq from '@/components/contact/AdminFaq.vue'
// import AdminFormSetting from '@/components/contact/AdminFormSetting.vue'
// import AdminMapsSection from '@/components/contact/AdminMapsSection.vue'
// import AdminContactHero from '@/components/contact/AdminContactHero.vue'
// import AdminNewsletter from '@/components/contact/AdminNewsletter.vue'
// import AdminContactInfo from '@/components/contact/AdminContactInfo.vue'
import MediaManager from '@/views/media/MediaManager.vue'
import MediaList from '@/views/media/MediaList.vue'
import AdminFooter from '@/components/AdminFooter.vue'
// import VisiMisi from '@/components/about/VisiMisi.vue'
import AdminTheme from '@/components/theme/AdminTheme.vue'

// import PostList from '@/views/posts/PostList.vue'
// import PostForm from '@/views/posts/PostForm.vue'
// import PageList from '@/views/pages/PageList.vue'
// import PageForm from '@/views/pages/PageForm.vue'
import ProductList from '@/views/products/ProductList.vue'
import ProductForm from '@/views/products/ProductForm.vue'
import CategoryList from '@/views/category/CategoryList.vue'
import CategoryForm from '@/views/category/CategoryForm.vue'
import TestimonialForm from '@/views/testimonial/TestimonialForm.vue'
import TestimonialList from '@/views/testimonial/TestimonialList.vue'
import LogoManager from '@/components/LogoManager.vue'
import FaviconManager from '@/components/FaviconManager.vue'
import SiteSetting from '@/views/pengaturan/SiteSetting.vue'
// import MenuDetailManager from '@/components/menu/MenuDetailManager.vue'
import MenuTree from '@/components/menu/MenuTree.vue'


const routes = [
  { path: '/',redirect: '/login' }, { path: '/login', name: 'LoginPage', component: LoginPage }, 
  { path: '/reset-password/:token', name: 'ResetPassword', component: () => import('@/views/ResetPassword.vue') },  
  { path: '/admin/users', component: () => import('@/views/AdminUserManagement.vue'), meta: { requiresAdmin: true }}, 
  { path: '/adminDashboard', name: 'AdminDashboard', component: AdminDashboard, meta: { requiresAuth: true } }, 
  { path: '/admin/userManagement', name: 'AdminUserManagement', component: AdminUserManagement, meta: { requiresAuth: true } },
  { path: '/admin/ProfileManagement', name: 'ProfileManagement', component: ProfileManagement, meta: { requiresAuth: true } },
  // { path: '/admin/portfolio', name: 'PortfolioPage', component: PortfolioPage, meta: { requiresAuth: true } },
  // { path: '/Admin/Adminherohome', name: 'Adminherohome', component: AdminHeroHome,},
  // { path: '/admin/ourteam', name: 'OurTeam', component: OurTeam,},
  { path: '/admin/menus',name: 'MenuManager',component: MenuManager,},
  // { path: '/Admin/aboutpreview', name: 'AboutPreview',component: AboutPreview,},
  // { path: '/admin/abouthero', name: 'AboutHero', component: AboutHero,},
  // { path: '/admin/admintestimonials', name: 'AdminTestimonials',component: AdminTestimonials,},
  // { path: '/admin/whychooseusadmin', name: 'WhyChooseUsAdmin',component: WhyChooseUsAdmin,},
  // { path: '/admin/admincta',name: 'AdminCTA',component: AdminCTA,},
  // { path: '/admin/portfoliopreview', name: 'PortfolioPreview',component: PortfolioPreview,},
  // { path: '/admin/heroservices', name: 'HeroServices', component: HeroServices,},
  // { path: '/admin/serviceslist', name: 'ServicesList', component: ServicesList,},
  // { path: '/admin/valueSection',name: 'ValueSection', component: ValueSection,},
  // { path: '/admin/adminprocesssection', name: 'AdminProcessSection',component: AdminProcessSection, },
  // { path: '/admin/adminfaq', name: 'AdminFaq', component: AdminFaq,},
  // { path: '/admin/AdminFormSetting', name: 'AdminFormSetting', component: AdminFormSetting,},
  // { path: '/admin/adminmapssection', name: 'AdminMapsSection',component: AdminMapsSection,},
  // { path: '/admin/admincontacthero',name: 'AdminContactHero', component: AdminContactHero,},
  // { path: '/admin/adminnewsletter', name: 'AdminNewsletter',component: AdminNewsletter,},
  // { path: '/admin/admincontactinfo', name: 'AdminContactInfo',component: AdminContactInfo,},
  { path: '/mediamanager',name: 'MediaManager',component: MediaManager,},
  { path: '/MediaList',name: 'MediaList',component: MediaList,},
  { path: '/admin/adminfooter',name: 'AdminFooter',component: AdminFooter,},
  // { path: '/admin/visimisi',name: 'VisiMisi',component: VisiMisi,},
  { path: '/admintheme',name: 'AdminTheme',component: AdminTheme,},
  { path: '/admin/logomanager',name: 'LogoManager',component: LogoManager,},
  { path: '/admin/faviconmanager',name: 'FaviconManager',component: FaviconManager,},
  {path: '/admin/pengaturan',name: 'SiteSetting',component: SiteSetting,},
  // {path: '/admin/menumanager',name: 'MenuDetailManager',component: MenuDetailManager,},
  {path: '/admin/menutree',name: 'MenuTree',component: MenuTree,},
  // {path: '/admin/posts', name: 'PostList', component: PostList},
  // {path: '/admin/posts/create',name: 'PostCreate',component: PostForm},
  // {path: '/admin/posts/:id', name: 'EditPost', component: () => import('@/views/posts/PostForm.vue'), props: true},  
  // { path: '/admin/pages', name: 'PageList', component: PageList},
  // {path: '/admin/pages/create', name: 'PageCreate', component: PageForm},
  { path: '/admin/pages/:id', name: 'EditPage', component: () => import('@/views/pages/PageForm.vue'), props: true
  },  

  {
    path: '/admin/products',
    name: 'ProductList',
    component: ProductList
  },
  {
    path: '/admin/products/create',
    name: 'ProductCreate',
    component: ProductForm
  },
  {
    path: '/admin/products/:id',
    name: 'ProductEdit',
    component: () => import('@/views/products/ProductForm.vue'),
    props: true
  },
  
  {
    path: '/admin/categories',
    name: 'CategoryList',
    component: CategoryList
  },
  {
    path: '/admin/categories/create',
    name: 'CategoryCreate',
    component: CategoryForm
  },
  {
    path: '/admin/categories/:id',
    name: 'CategoryEdit',
    component: () => import('@/views/category/CategoryForm.vue'),
    props: true
  },

  {
    path: '/admin/testimonials',
    name: 'TestimonialList',
    component: TestimonialList
  },
  {
    path: '/admin/testimonials/create',
    name: 'TestimonialCreate',
    component: TestimonialForm
  },
  {
    path: '/admin/testimonials/:id',
    name: 'TestimonialEdit',
    component: () => import('@/views/testimonial/TestimonialForm.vue'),
    props: true
  },
  {
    path: '/admin/custom-pages',
    name: 'CustomPageManager',
    component: () => import('@/views/pages/CustomPageManager.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/custom-pages/edit/:page/:section/:id?',
    name: 'CustomPageSection',
    component: () => import('@/views/pages/CustomPageForm.vue'),
    meta: { requiresAuth: true }
  },

  {
    path: '/admin/custom-pages/:page',
    name: 'CustomPageDetail',
    component: () => import('@/views/pages/CustomPageDetail.vue')
  },
  {
    path: '/schema-editor',
    name: 'SchemaEditor',
    component: () => import('@/components/theme/SchemaEditor.vue'),
    props: route => ({ themeId: route.query.theme_id })
  },
    {
    path: '/admin/menus',
    name: 'MenuPage',
    component: () => import('@/components/menu/MenuPage.vue') // atau lokasi sesuai
  },
  {
    path: '/admin/menus/:id',
    name: 'MenuDetailManager',
    component: () => import('@/components/menu/MenuDetailManager.vue'),
    props: true,
  },
 {
  path: '/admin/posts/:slug',
  name: 'EditPost',
  component: () => import('@/views/posts/PostForm.vue'),
  meta: { requiresAuth: true }
},
{
  path: '/admin/posts',
  name: 'PostList',
  component: () => import('@/views/posts/PostList.vue')
},
{
  path: '/admin/posts/create',
  name: 'PostCreate',
  component: () => import('@/views/posts/PostForm.vue')
},
{
  path: '/admin/posts/edit/:slug',
  name: 'PostEdit',
  component: () => import('@/views/posts/PostForm.vue')
},
{
  path: '/admin/pages/create',
  name: 'PageCreate',
  component: () => import('@/views/pages/PageForm.vue')
},
{
  path: '/admin/pages/edit/:slug',
  name: 'EditPage',
  component: () => import('@/views/pages/PageForm.vue')
},
{
  path: '/admin/pages/:slug',
  name: 'PageListBySlug',
  component: () => import('@/views/pages/PageList.vue')
},
{
  path: '/admin/pages',
  name: 'PageList',
  component: () => import('@/views/pages/PageList.vue')
},

// Transaksi
{
  path: '/admin/transaksi/topup',
  name: 'Topup',
  component: () => import('@/views/transaksi/TopUp.vue'),
},
{
  path: '/admin/transaksi/withdraw',
  name: 'Withdraw',
  component: () => import('@/views/transaksi/WithdrawPage.vue'),
},
{
  path: '/admin/transaksi/adjust',
  name: 'Adjust',
  component: () => import('@/views/transaksi/AdjustPage.vue'),
},

{
  path: '/admin/transaksi/history',
  name: 'TransaksiHistoryPage',
  component: () => import('@/views/transaksi/TransaksiHistoryPage.vue'),
},
{
  path: '/admin/transaksi/TransaksiHistory',
  name: 'TransaksiHistory',
  component: () => import('@/views/transaksi/TransaksiHistory.vue'),
},

{
  path: '/admin/bank/CompanyBank',
  name: 'CompanyBank',
  component: () => import('@/views/bank/CompanyBank.vue'),
},

]

const base = process.env.VUE_APP_BASE_PATH || '/'
const router = createRouter({
  history: createWebHistory(base),
  routes,
})

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp < Date.now() / 1000
  } catch (e) {
    return true // Anggap expired kalau parsing gagal
  }
}
// Auth Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  let user = null

  try {
    user = JSON.parse(localStorage.getItem('user'))
  } catch (e) {
    localStorage.removeItem('user')
  }


  if (token && isTokenExpired(token)) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return next({ name: 'LoginPage' })
  }

  if (to.meta.requiresAuth && !token) {
    return next({ name: 'LoginPage' })
  }

  if (to.meta.adminOnly && user?.role !== 'admin') {
    return next('/not-authorized')
  }

  next()
})


export default router
