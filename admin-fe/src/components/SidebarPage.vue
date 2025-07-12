<!-- Sidebar -->
<template>
 <aside
    class="fixed top-0 left-0 z-40 w-52 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl transition-transform duration-300 ease-in-out"
    :class="[isOpen ? 'translate-x-0' : '-translate-x-full']">
    <!-- Header -->
    <div class="p-6 border-b border-slate-700/50">
      <router-link :to="{ name: 'AdminDashboard' }"
        class="group flex items-center space-x-3 hover:text-amber-400 transition-colors duration-200"
      >
        <span class="font-bold text-xl tracking-wide group-hover:scale-105 transition-transform duration-200">
          Dashboard
        </span>
      </router-link>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 px-4 py-6 overflow-y-auto max-h-[calc(100vh-100px)]">
      <ul class="space-y-2">

        <!-- Static -->
        <li>
          <router-link 
            to="/admin/menus" 
            class="group flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-700/50 hover:text-amber-400 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg text-slate-200"
             :class="{ 'bg-slate-700/70 text-amber-400': isActivePath('/admin/menus') }"
          >
            <span class="font-medium">Navbar Menu</span>
          </router-link>
        </li>

        <!-- Footer -->
        <li>
          <router-link 
              to="/admin/adminfooter" 
              class="group flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-700/50 hover:text-amber-400 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg text-slate-200"
              :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActivePath('/admin/adminfooter') }"
            >
              <span class="font-medium">Footer</span>
            </router-link>
        </li>

        <!-- Konten Dropdown -->
        <li class="relative">
          <div
            @click="toggleDropdown('konten')"
            class="group flex items-center justify-between w-full px-4 py-3 text-left rounded-xl cursor-pointer hover:bg-slate-700/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
            :class="dropdownOpen === 'konten' ? 'bg-slate-700/70 text-amber-400' : 'text-slate-200'"
          >
            <span class="font-medium">Konten</span>
            <svg class="w-4 h-4 transition-transform duration-200" :class="dropdownOpen === 'konten' ? 'rotate-180' : ''" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </div>

          <transition>
            <ul v-show="dropdownOpen === 'konten'" class="mt-2 ml-4 space-y-1 border-l-2 border-amber-400/30 pl-4">
              <!-- HOME -->
              <li class="relative">
                <div @click.stop="toggleSubDropdown('home')" class="dropdown-btn" :class="subDropdownOpen === 'home' ? 'text-amber-400 bg-slate-700/50' : ''">
                  <span>Home</span>
                  <svg class="w-3 h-3" :class="subDropdownOpen === 'home' ? 'rotate-180' : ''" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <transition>
                  <ul v-show="subDropdownOpen === 'home'" class="dropdown-submenu">
                    <li><router-link to="/admin/AdminHeroHome" class="submenu-link">Hero Home</router-link></li>
                    <li><router-link to="/admin/aboutpreview" class="submenu-link">About Preview</router-link></li>
                    <li><router-link to="/admin/whychooseusadmin" class="submenu-link">Why Choose Us</router-link></li>
                    <!-- <li><router-link to="/admin/admintestimonials" class="submenu-link">Testimonials</router-link></li> -->
                    <li><router-link to="/admin/portfoliopreview" class="submenu-link">Portfolio Preview</router-link></li>
                  </ul>
                </transition>
              </li>

              <!-- ABOUT -->
              <li class="relative">
                <div @click.stop="toggleSubDropdown('about')" class="dropdown-btn" :class="subDropdownOpen === 'about' ? 'text-amber-400 bg-slate-700/50' : ''">
                  <span>About</span>
                  <svg class="w-3 h-3" :class="subDropdownOpen === 'about' ? 'rotate-180' : ''" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <transition>
                  <ul v-show="subDropdownOpen === 'about'" class="dropdown-submenu">
                    <li><router-link to="/admin/abouthero" class="submenu-link">Hero About</router-link></li>
                    <li><router-link to="/admin/ValueSection" class="submenu-link">Value</router-link></li>
                    <li><router-link to="/admin/ourteam" class="submenu-link">Team</router-link></li>
                    <li><router-link to="/admin/Visimisi" class="submenu-link">Visi Misi</router-link></li>
                  </ul>
                </transition>
              </li>

              <!-- SERVICES -->
              <li class="relative">
                <div @click.stop="toggleSubDropdown('services')" class="dropdown-btn" :class="subDropdownOpen === 'services' ? 'text-amber-400 bg-slate-700/50' : ''">
                  <span>Services</span>
                  <svg class="w-3 h-3" :class="subDropdownOpen === 'services' ? 'rotate-180' : ''" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <transition>
                  <ul v-show="subDropdownOpen === 'services'" class="dropdown-submenu">
                    <li><router-link to="/admin/heroservices" class="submenu-link">Hero Services</router-link></li>
                    <li><router-link to="/admin/servicesList" class="submenu-link">Service List</router-link></li>
                    <li><router-link to="/admin/AdminProcessSection" class="submenu-link">Process Services</router-link></li>
                  </ul>
                </transition>
              </li>

              <!-- CONTACT -->
              <li class="relative">
                <div @click.stop="toggleSubDropdown('contact')" class="dropdown-btn" :class="subDropdownOpen === 'contact' ? 'text-amber-400 bg-slate-700/50' : ''">
                  <span>Contact</span>
                  <svg class="w-3 h-3" :class="subDropdownOpen === 'contact' ? 'rotate-180' : ''" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <transition>
                  <ul v-show="subDropdownOpen === 'contact'" class="dropdown-submenu">
                    <li><router-link to="/admin/AdminContactHero" class="submenu-link">Hero Contact</router-link></li>
                    <li><router-link to="/admin/AdminFormSetting" class="submenu-link">Message</router-link></li>
                    <li><router-link to="/admin/AdminNewsletter" class="submenu-link">Subscriber</router-link></li>
                    <li><router-link to="/admin/AdminContactInfo" class="submenu-link">Contact Info</router-link></li>
                    <li><router-link to="/admin/AdminMapsSection" class="submenu-link">Maps</router-link></li>
                    <li><router-link to="/admin/Adminfaq" class="submenu-link">FAQ</router-link></li>
                  </ul>
                </transition>
              </li>

            <!-- Blog -->
            <!-- <li>
              <router-link 
                to="/Blog" 
                class="group flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-700/50 hover:text-amber-400 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg text-slate-200">
                  <span class="font-regular">Blog</span>
              </router-link>
            </li> -->
              <!-- PORTFOLIO & CTA -->
              <li><router-link to="/admin/portfolio" class="submenu-link">Portfolio</router-link></li>
              <li><router-link to="/admin/admincta" class="submenu-link">CTA</router-link></li>
            </ul>
          </transition>
        </li>


        <li>
          <router-link 
            to="/MediaManager" 
            class="group flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-700/50 hover:text-amber-400 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg text-slate-200"
            :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActivePath('/MediaManager') }"
          >
            <span class="font-medium">Media</span>
          </router-link>
        </li>

        <li>
          <div
            @click="toggleDropdown('theme')"
            class="group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer hover:bg-slate-700/50 hover:text-amber-400 transition-all duration-200 text-slate-200"
            :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': dropdownOpen === 'theme' }"
          >
            <div class="flex items-center space-x-3">
              <span class="font-medium">Theme</span>
            </div>
            <svg class="w-3 h-3 ml-auto" :class="subDropdownOpen === 'pages' ? 'rotate-180' : ''" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
          </div>
          <transition>
            <ul
              v-show="dropdownOpen === 'theme'"
              class="dropdown-submenu">
              <li>
                <router-link
                  to="/admintheme"
                  class="submenu-link"
                  :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActivePath('/admintheme') }">
                  List Theme
                </router-link>
              </li>
            </ul>
          </transition>
        </li>

     <!-- Posts -->
      <li class="relative">
        <div @click.stop="toggleSubDropdown('posts')" class="dropdown-btn flex items-center gap-2" :class="subDropdownOpen === 'posts' ? 'text-amber-400 bg-slate-700/50' : ''">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 011 1v1.382a1 1 0 00.553.894l3.618 1.809A1 1 0 0114 7v1l3 5H3l3-5V7a1 1 0 01-.171-.915l3.618-1.809A1 1 0 0010 4.382V3a1 1 0 00-1-1z" />
            <path d="M7 13h6v2a3 3 0 01-6 0v-2z" />
          </svg>
          <span>Posts</span>
          <svg class="w-3 h-3 ml-auto" :class="subDropdownOpen === 'posts' ? 'rotate-180' : ''" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </div>
        <transition>
          <ul v-show="subDropdownOpen === 'posts'" class="dropdown-submenu">
            <router-link :to="{ name: 'PostList' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('PostList') }">All Posts</router-link>
            <router-link :to="{ name: 'PostCreate' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('PostCreate') }">Add Posts</router-link>
            <router-link :to="{ name: 'CategoryList' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('CategoryList') }">All Categories</router-link>
            <router-link :to="{ name: 'CategoryCreate' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('CategoryCreate') }">Add Category</router-link>
            <!-- <router-link :to="{ name: 'TestimonialList' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('TestimonialList') }">All Testimonials</router-link> -->
            <!-- <router-link :to="{ name: 'TestimonialCreate' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('TestimonialCreate') }">Add Testimonials</router-link> -->
          </ul>
        </transition>
      </li>

      <!-- Pages -->
      <li class="relative">
        <div @click.stop="toggleSubDropdown('pages')" class="dropdown-btn flex items-center gap-2" :class="subDropdownOpen === 'pages' ? 'text-amber-400 bg-slate-700/50' : ''">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 2a1 1 0 00-1 1v18a1 1 0 001.447.894L12 19.118l5.553 2.776A1 1 0 0019 21V3a1 1 0 00-1-1H6z" />
          </svg>
          <span>Pages</span>
          <svg class="w-3 h-3 ml-auto" :class="subDropdownOpen === 'pages' ? 'rotate-180' : ''" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </div>
        <transition>
          <ul v-show="subDropdownOpen === 'pages'" class="dropdown-submenu">
            <router-link :to="{ name: 'PageList' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('PageList') }">All Pages</router-link>
            <router-link :to="{ name: 'PageCreate' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('PageCreate') }">Add Pages</router-link>
            <router-link :to="{ name: 'CustomPageManager' }" class="submenu-link"> All Custom Pages</router-link>
          </ul>
        </transition>
      </li>

      <!-- Products -->
      <li class="relative">
        <div @click.stop="toggleSubDropdown('products')" class="dropdown-btn flex items-center gap-2" :class="subDropdownOpen === 'products' ? 'text-amber-400 bg-slate-700/50' : ''">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 6H4V4h16v2zm0 4H4v2h16v-2zm0 6H4v2h16v-2z"/>
          </svg>
          <span>Products</span>
          <svg class="w-3 h-3 ml-auto" :class="subDropdownOpen === 'products' ? 'rotate-180' : ''" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </div>
        <transition>
          <ul v-show="subDropdownOpen === 'products'" class="dropdown-submenu">
            <router-link :to="{ name: 'ProductList' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('ProductList') }">All Products</router-link>
            <router-link :to="{ name: 'ProductCreate' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('ProductCreate') }">Add New</router-link>
          </ul>
        </transition>
      </li>

      <!-- Testimonials -->
      <li class="relative">
        <div @click.stop="toggleSubDropdown('testimonials')" class="dropdown-btn flex items-center gap-2" :class="subDropdownOpen === 'testimonials' ? 'text-amber-400 bg-slate-700/50' : ''">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          <span>Testimonials</span>
          <svg class="w-3 h-3 ml-auto" :class="subDropdownOpen === 'testimonials' ? 'rotate-180' : ''" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </div>
        <transition>
          <ul v-show="subDropdownOpen === 'testimonials'" class="dropdown-submenu">
            <router-link :to="{ name: 'TestimonialList' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('TestimonialList') }">All Testimonials</router-link>
            <router-link :to="{ name: 'TestimonialCreate' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('TestimonialCreate') }">Add Testimonials</router-link>
          </ul>
        </transition>
      </li>

  <!-- Category -->
        <!-- <li class="relative">
          <div @click.stop="toggleSubDropdown('categories')" class="dropdown-btn" :class="subDropdownOpen === 'categories' ? 'text-amber-400 bg-slate-700/50' : ''">
            <span>Category</span>
            <svg class="w-3 h-3" :class="subDropdownOpen === 'categories' ? 'rotate-180' : ''" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </div>
          <transition>
            <ul v-show="subDropdownOpen === 'categories'" class="dropdown-submenu">
              <router-link :to="{ name: 'CategoryList' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('CategoryList') }">All Categories</router-link>
              <router-link :to="{ name: 'CategoryCreate' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('CategoryCreate') }"> Add New </router-link>
            </ul>
          </transition>
        </li> -->

      </ul>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-slate-700/50">
      <div class="text-xs text-slate-400 text-center">
        Admin Panel v2.0 by Phisoft
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  props: {
    isOpen: Boolean
  },
  emits: ['update:isOpen'],
  data() {
    return {
      sidebarOpen: true,
      dropdownOpen: '',
      subDropdownOpen: ''
    }
  },
  created() {
  const savedOpen = localStorage.getItem('sidebar_isOpen')
  if (savedOpen !== null) {
    this.$emit('update:isOpen', savedOpen === 'true')
  }

  this.dropdownOpen = localStorage.getItem('sidebar_dropdownOpen') || ''
  
  const savedSub = localStorage.getItem('sidebar_subDropdownOpen')
  if (['home', 'about', 'services', 'contact', 'posts', 'pages', 'products'].includes(savedSub)) {
    this.subDropdownOpen = savedSub
  } else {
    this.subDropdownOpen = ''
  }
},
  methods: {
    toggleDropdown(name) {
      const newState = this.dropdownOpen === name ? '' : name
      this.dropdownOpen = newState
      localStorage.setItem('sidebar_dropdownOpen', newState)

      if (newState !== 'konten') {
        this.subDropdownOpen = ''
        localStorage.removeItem('sidebar_subDropdownOpen')
      }
    },
    toggleSubDropdown(name) {
  const newSubState = this.subDropdownOpen === name ? '' : name
  this.subDropdownOpen = newSubState
  localStorage.setItem('sidebar_subDropdownOpen', newSubState)
},
    closeDropdown() {
      this.dropdownOpen = ''
      this.subDropdownOpen = ''
      localStorage.removeItem('sidebar_dropdownOpen')
      localStorage.removeItem('sidebar_subDropdownOpen')
    },
    isActivePath(path) {
    return this.currentPath === path;
  },
  isActivePrefix(prefix) {
    return this.currentPath.startsWith(prefix);
  },
  isActiveName(name) {
    return this.currentRouteName === name;
  }
  },

  computed: {
  currentPath() {
    return this.$route.path;
  },
  currentRouteName() {
    return this.$route.name;
  }
}

}
</script>

<style scoped>
.dropdown-btn {
  @apply flex justify-between items-center px-3 py-2 text-sm text-slate-300 cursor-pointer rounded-lg hover:bg-slate-700/30 hover:text-amber-400 transition-all duration-200;
}
.dropdown-submenu {
  @apply mt-2 ml-4 space-y-1 border-l border-slate-600/30 pl-3;
}
.submenu-link {
  @apply flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 rounded-lg hover:bg-slate-700/30 hover:text-amber-400 transition-all duration-200 hover:translate-x-1;
}
</style>
