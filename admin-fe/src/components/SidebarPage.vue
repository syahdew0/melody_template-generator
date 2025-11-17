<!-- Sidebar -->
<template>
 <aside
    class="fixed top-0 left-0 z-40 w-52 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl transition-transform duration-300 ease-in-out"
    :class="[isOpen ? 'translate-x-0' : '-translate-x-full']">
    <!-- Header -->
    <div class="p-6 border-b border-slate-700/50">
     <H1 class="group flex items-center space-x-3 hover:text-amber-400 transition-colors duration-200"></H1>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 px-4 py-6 overflow-y-auto max-h-[calc(100vh-100px)]">
      <ul class="space-y-2">

    <li class="relative">
      <div 
        @click.stop="toggleSubDropdown('dashboard')" 
        class="dropdown-btn flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-colors duration-200"
        :class="subDropdownOpen === 'dashboard' ? 'text-amber-400 bg-slate-700/50' : ''"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
        </svg>
        <span class="font-regular text-md">Dashboard</span>
        <svg class="w-3 h-3 ml-auto transform transition-transform duration-200" 
            :class="subDropdownOpen === 'dashboard' ? 'rotate-180' : ''" 
            fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </div>

      <transition>
        <ul v-show="subDropdownOpen === 'dashboard'" class="dropdown-submenu">
          <router-link :to="{ name: 'AdminDashboard' }"
            class=" transition-colors duration-200"
          >
            <span class="font-bold text-sm tracking-wide group-hover:scale-105 transition-transform duration-200">
              Dashboard
            </span>
          </router-link>
        
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
          <span class="font-regular text-md">Posts</span>
          <svg class="w-3 h-3 ml-auto" :class="subDropdownOpen === 'posts' ? 'rotate-180' : ''" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </div>
        <transition>
          <ul v-show="subDropdownOpen === 'posts'" class="dropdown-submenu">
            <router-link :to="{ name: 'PostList' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('PostList') }">All Posts</router-link>
            <!-- <router-link :to="{ name: 'PostCreate' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('PostCreate') }">Add Posts</router-link> -->
            <router-link :to="{ name: 'CategoryList' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('CategoryList') }">All Categories</router-link>
            <!-- <router-link :to="{ name: 'CategoryCreate' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('CategoryCreate') }">Add Category</router-link> -->
            <router-link :to="{ name: 'TestimonialList' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('TestimonialList') }">All Testimonials</router-link>
            <!-- <router-link :to="{ name: 'TestimonialCreate' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('TestimonialCreate') }">Add Testimonials</router-link> -->
          </ul>
        </transition>
      </li>

      <li class="relative">
  <div
    @click.stop="toggleSubDropdown('listing')"
    class="dropdown-btn flex items-center gap-2"
    :class="subDropdownOpen === 'listing' ? 'text-amber-400 bg-slate-700/50' : ''"
  >
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4 4h16v2H4zm0 6h16v2H4zm0 6h16v2H4z"/>
    </svg>
    <span class="font-regular">Listing</span>
    <svg class="w-3 h-3 ml-auto" :class="subDropdownOpen === 'listing' ? 'rotate-180' : ''" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clip-rule="evenodd"/>
    </svg>
  </div>

<!-- LISTING TYPE DROPDOWN -->
<transition>
  <ul v-show="subDropdownOpen === 'listing'" class="dropdown-submenu">
    <!-- per type: buka halaman ListingList dengan filter type -->
    <li v-for="type in listingTypes" :key="type.id">
      <router-link
        :to="{ 
          name: 'ListingList', 
          query: { type: type.id } 
        }"
        class="px-4 py-2 block hover:bg-slate-700"
        :class="{ 'bg-slate-700 text-amber-400': isActiveListing(type.id) }"
      >
        {{ type.name }}
      </router-link>
    </li>

    <!-- optional: semua listing tanpa filter -->
    <!-- <li>
      <router-link
        :to="{ name: 'ListingList' }"
        class="px-4 py-2 block hover:bg-slate-700"
        :class="{ 'bg-slate-700 text-amber-400': $route.name === 'ListingList' && !$route.query.type }"
      >
        Semua Listing
      </router-link>
    </li> -->
  </ul>
</transition>
</li>


      <!-- Media -->
      <li class="relative">
        <div
          @click.stop="toggleSubDropdown('media')"
          class="dropdown-btn flex items-center gap-2"
          :class="subDropdownOpen === 'media' ? 'text-amber-400 bg-slate-700/50' : ''"
        >
          <!-- Icon media -->
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M3 16.5V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25v13.5A2.25 2.25 0 0118.75 21H7.5l-4.5-4.5zM16.5 9.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          </svg>
          <span class="font-regular text-md">Media</span>

          <!-- Icon panah -->
          <svg class="w-3 h-3 ml-auto" :class="subDropdownOpen === 'media' ? 'rotate-180' : ''" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd" />
          </svg>
        </div>

        <transition>
          <ul v-show="subDropdownOpen === 'media'" class="dropdown-submenu">
            <router-link :to="{ name: 'MediaManager' }" class="submenu-link"
              :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('MediaManager') }">New Media</router-link>
            <router-link :to="{ name: 'MediaList' }" class="submenu-link"
              :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('MediaList') }">Daftar Media</router-link>
          </ul>
        </transition>
      </li>

      <!-- Tampilan -->
       <li>
        <div
          @click="toggleDropdown('tampilan')"
          class="group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer hover:bg-slate-700/50 hover:text-amber-400 transition-all duration-200 text-slate-200"
          :class="{ 'bg-slate-700/70 text-amber-400 font-regular': dropdownOpen === 'tampilan' }"
        >
          <div class="flex items-center space-x-3">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M4 4h16v12H4z" />
              <path d="M12 16v4" />
              <path d="M8 20h8" />
            </svg>
            <span class="font-regular text-md">Tampilan</span>
          </div>
          <svg 
            class="w-3 h-3 ml-auto transform transition-transform duration-200" 
            :class="{ 'rotate-180': dropdownOpen === 'tampilan' }"
            fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </div>

        <!-- Submenu -->
        <transition>
          <ul v-show="dropdownOpen === 'tampilan'" class="dropdown-submenu">
            <li>
              <router-link
                to="/admin/logomanager"
                class="submenu-link"
                :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActivePath('/adminlogo') }"
              >
                Logo
              </router-link>
            </li>
            <li>
              <router-link
                to="/admin/faviconmanager"
                class="submenu-link"
                :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActivePath('/adminicon') }"
              >
                Ikon
              </router-link>

              <router-link 
                to="/admin/menus" 
                class=" submenu-link "
                :class="{ 'font-regular bg-slate-700/70 text-amber-400': isActivePath('/admin/menus') }"
              >
                <span class="font-medium">Daftar Menu</span>
              </router-link>
           
            </li> 
              <li>

              </li>
            </ul>
          </transition>
        </li>

      <!-- THEME -->
        <li>
          <div
            @click="toggleDropdown('theme')"
            class="group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer hover:bg-slate-700/50 hover:text-amber-400 transition-all duration-200 text-slate-200"
            :class="{ 'bg-slate-700/70 text-amber-400 font-regular': dropdownOpen === 'theme' }"
          >
            <!-- Icon Pensil dan Label -->
            <div class="flex items-center space-x-3">
              <!-- Feather style pencil icon -->
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
              <span class="font-regular">Theme</span>
            </div>

            <!-- Icon Panah Bawah -->
            <svg 
              class="w-3 h-3 ml-auto transform transition-transform duration-200" 
              :class="{ 'rotate-180': dropdownOpen === 'theme' }"
              fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </div>

          <!-- Submenu -->
          <transition>
            <ul v-show="dropdownOpen === 'theme'" class="dropdown-submenu">
              <li>
                <router-link
                  to="/admintheme"
                  class="submenu-link"
                  :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActivePath('/admintheme') }"
                >
                  List Theme
                </router-link>
              </li>
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
            <!-- <router-link :to="{ name: 'PageCreate' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('PageCreate') }">Add Pages</router-link> -->
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
            <!-- <router-link :to="{ name: 'ProductCreate' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('ProductCreate') }">Add New</router-link> -->
             <router-link :to="{ name: 'OrderHistory' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('OrderHistory') }">Order History</router-link>
               <!-- <router-link :to="{ name: 'OrderDetail' }" class="submenu-link" :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('OrderDetail') }">Order Detail</router-link> -->
          </ul>
        </transition>
      </li>

      <!-- Site Setting -->
       <li class="relative">
        <div
          @click.stop="toggleSubDropdown('setting')"
          class="dropdown-btn flex items-center gap-2"
          :class="subDropdownOpen === 'setting' ? 'text-amber-400 bg-slate-700/50' : ''"
        >
          <!-- Icon setting -->
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M11.983 2.25c.621 0 1.198.385 1.405.978l.347.98a1.162 1.162 0 001.494.723l.962-.321a1.374 1.374 0 011.61.628l.28.488a1.375 1.375 0 01-.268 1.684l-.77.77a1.125 1.125 0 000 1.59l.77.77a1.375 1.375 0 01.268 1.684l-.28.488a1.374 1.374 0 01-1.61.628l-.962-.321a1.162 1.162 0 00-1.494.723l-.347.98a1.417 1.417 0 01-1.405.978h-.002a1.417 1.417 0 01-1.405-.978l-.347-.98a1.162 1.162 0 00-1.494-.723l-.962.321a1.374 1.374 0 01-1.61-.628l-.28-.488a1.375 1.375 0 01.268-1.684l.77-.77a1.125 1.125 0 000-1.59l-.77-.77a1.375 1.375 0 01-.268-1.684l.28-.488a1.374 1.374 0 011.61-.628l.962.321a1.162 1.162 0 001.494-.723l.347-.98c.207-.593.784-.978 1.405-.978z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>

          <span class="font-regular text-md">Setting</span>

          <!-- Icon panah -->
          <svg class="w-3 h-3 ml-auto" :class="subDropdownOpen === 'setting' ? 'rotate-180' : ''" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd" />
          </svg>
        </div>

        <transition>
          <ul v-show="subDropdownOpen === 'setting'" class="dropdown-submenu">
            <router-link
              :to="{ name: 'SiteSetting' }"
              class="submenu-link"
              :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('SiteSetting') }"
            >
              Site Setting
            </router-link>
          </ul>
        </transition>
      </li>

      <!-- Role -->
<li class="relative">
  <div
    @click.stop="toggleSubDropdown('role')"
    class="dropdown-btn flex items-center gap-2"
    :class="subDropdownOpen === 'role' ? 'text-amber-400 bg-slate-700/50' : ''"
  >
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2a5 5 0 00-5 5v2H5a1 1 0 000 2h2v2H5a1 1 0 000 2h2v2a5 5 0 005 5 5 5 0 005-5v-2h2a1 1 0 000-2h-2v-2h2a1 1 0 000-2h-2V7a5 5 0 00-5-5z"/>
    </svg>
    <span>Role</span>
    <svg
      class="w-3 h-3 ml-auto"
      :class="subDropdownOpen === 'role' ? 'rotate-180' : ''"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path fill-rule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clip-rule="evenodd"/>
    </svg>
  </div>

  <transition>
    <ul v-show="subDropdownOpen === 'role'" class="dropdown-submenu">
      <router-link
        :to="{ name: 'RolePage' }"
        class="submenu-link"
        :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('RolePage') }"
      >
        Daftar Role
      </router-link>
      <router-link
        :to="{ name: 'CreateRolePage' }"
        class="submenu-link"
        :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('CreateRolePage') }"
      >
        Role Baru
      </router-link>
    </ul>
  </transition>
</li>

      <!-- Transaksi -->
        <li class="relative">
            <!-- Toggle Button -->
            <div @click.stop="toggleSubDropdown('transaksi')" 
                class="dropdown-btn" 
                :class="subDropdownOpen === 'transaksi' ? 'text-amber-400 bg-slate-700/50' : ''">
              <span>Transaksi</span>
              <svg class="w-3 h-3" 
                  :class="subDropdownOpen === 'transaksi' ? 'rotate-180' : ''" 
                  fill="currentColor" 
                  viewBox="0 0 20 20">
                <path fill-rule="evenodd" 
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                      clip-rule="evenodd" />
              </svg>
            </div>

            <!-- Submenu -->
            <transition>
              <ul v-show="subDropdownOpen === 'transaksi'" class="dropdown-submenu">
                <router-link 
                  :to="{ name: 'Topup' }" 
                  class="submenu-link" 
                  :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('Topup') }">
                  Topup
                </router-link>
                
                <router-link 
                  :to="{ name: 'Withdraw' }" 
                  class="submenu-link" 
                  :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('Withdraw') }">
                  Withdraw
                </router-link>
                
                <router-link 
                  :to="{ name: 'Adjust' }" 
                  class="submenu-link" 
                  :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('Adjust') }">
                  Adjust
                </router-link>

                <router-link 
                  :to="{ name: 'TransaksiHistoryPage' }" 
                  class="submenu-link" 
                  :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('TransaksiHistoryPage') }">
                  Transaksi History
                </router-link>

                <router-link 
                  :to="{ name: 'SettingTransaksi' }" 
                  class="submenu-link" 
                  :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('SettingTransaksi') }">
                  Setting Transaksi
                </router-link>
              </ul>
            </transition>
          </li>


           <li class="relative">
              <div
                @click.stop="toggleSubDropdown('bank')"
                class="dropdown-btn flex items-center gap-2"
                :class="subDropdownOpen === 'bank' ? 'text-amber-400 bg-slate-700/50' : ''"
              >
                <span>BANK</span>
                <svg
                  class="w-3 h-3 ml-auto transition-transform"
                  :class="subDropdownOpen === 'bank' ? 'rotate-180' : ''"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <transition>
                <ul v-show="subDropdownOpen === 'bank'" class="dropdown-submenu">
                  <li>
                    <router-link
                      :to="{ name: 'CompanyBank' }"
                      class="submenu-link"
                      :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('CompanyBankList') }"
                    >
                      Company Bank
                    </router-link>
                     <router-link
                      :to="{ name: 'MasterBank' }"
                      class="submenu-link"
                      :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('MasterBankList') }"
                    >
                      Bank
                    </router-link>
                  </li>
                </ul>
              </transition>
            </li>

        <router-link
        to="/admin/user/customerlist"
        class="block py-2 px-3 rounded hover:bg-gray-700"
        active-class="bg-gray-700 font-semibold"
      >
        Daftar Customer
      </router-link>

        <router-link
        to="/admin/komentar/komentarlist"
        class="block py-2 px-3 rounded hover:bg-gray-700"
        active-class="bg-gray-700 font-semibold"
      >
        Komentar
      </router-link>

<!-- MLM -->
<li class="relative">
  <div
    @click="toggleSubDropdown('mlm')"
    class="dropdown-btn flex items-center gap-2 cursor-pointer"
    :class="subDropdownOpen === 'mlm' ? 'text-amber-400 bg-slate-700/50' : ''"
  >
    <!-- Icon MLM -->
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7L2 9h7z" />
    </svg>
    <span>MLM</span>
    <svg
      class="w-3 h-3 ml-auto transition-transform"
      :class="subDropdownOpen === 'mlm' ? 'rotate-180' : ''"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fill-rule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 
           10.586l3.293-3.293a1 1 0 
           111.414 1.414l-4 4a1 1 0 
           01-1.414 0l-4-4a1 1 0 
           010-1.414z"
        clip-rule="evenodd"
      />
    </svg>
  </div>

  <transition>
    <ul v-show="subDropdownOpen === 'mlm'" class="dropdown-submenu">
      <!-- Submenu MLM langsung -->
      <li>
        <router-link
          :to="{ name: 'MLMSetting' }"
          class="submenu-link"
          :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('MLMSetting') }"
        >
          Pengaturan MLM
        </router-link>
      </li>

       <li>
              <router-link
                :to="{ name: 'PackageBaru' }"
                class="submenu-link"
                :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('PackageBaru') }"
                @click.stop
              >
                Package Baru
              </router-link>
            </li>
            <li>
              <router-link
                :to="{ name: 'DaftarPackage' }"
                class="submenu-link"
                :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('DaftarPackage') }"
                @click.stop
              >
                Daftar Package
              </router-link>
            </li>

             <li>
              <router-link
                :to="{ name: 'MLMTree' }"
                class="submenu-link"
                :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('MLMTree') }"
                @click.stop
              >
                MLM Tree
              </router-link>
            </li>
       
            <li>
              <router-link
                :to="{ name: 'MLMTransaksi' }"
                class="submenu-link"
                :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('MLMTransaksi') }"
                @click.stop
              >
              Transaksi
              </router-link>
            </li>
              <li>
              <router-link
                :to="{ name: 'PaketUser' }"
                class="submenu-link"
                :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('PaketUser') }"
                @click.stop
              >
              Paket User
              </router-link>
            </li>

              <li>
              <router-link
                :to="{ name: 'MlmPengaduan' }"
                class="submenu-link"
                :class="{ 'bg-slate-700/70 text-amber-400 font-semibold': isActiveName('MlmPengaduan') }"
                @click.stop
              >
              Pengaduan
              </router-link>
            </li>

    </ul>
  </transition>
</li>

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
import { API_ENDPOINTS } from '@/config/api'
import axios from 'axios'

export default {
  props: {
    isOpen: Boolean
  },
  emits: ['update:isOpen', 'select-listing-type'],
  data() {
    return {
      sidebarOpen: true,
      dropdownOpen: '',
      subDropdownOpen: '',
       listingTypes: []
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

  this.fetchListingTypes() 
},
  methods: {
  isActiveListing(typeId) {
    // aktif kalau lagi di ListingList & query.type sama dengan typeId
    return (
      this.$route.name === 'ListingList' &&
      String(this.$route.query.type || '') === String(typeId)
    )
  },
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
async fetchListingTypes() {
  try {
    const res = await axios.get(API_ENDPOINTS.listingType.list)
    console.log('Listing types response:', res.data)
    this.listingTypes = res.data.data ?? res.data
  } catch (err) {
    console.error("Failed to load listing types:", err)
  }
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
