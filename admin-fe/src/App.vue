<template>
  <div>
    <!-- Layout admin kecuali di halaman login -->
    <div v-if="!isLoginPage" class="flex min-h-screen relative">
      <!-- Overlay untuk mobile -->
      <div
        v-if="sidebarOpen && isMobile"
        class="fixed inset-0 bg-black bg-opacity-50 z-40"
        @click="sidebarOpen = false"
      ></div>

      <!-- Sidebar -->
      <SidebarPage
        :isOpen="sidebarOpen"
        @closeSidebar="sidebarOpen = false"
        class="z-50"
      />

      <!-- Konten utama -->
      <div
        class="flex-1 transition-all duration-300 min-h-screen"
        :class="{
          'ml-0': isMobile,
          'ml-52': !isMobile && sidebarOpen,
        }"
      >
        <NavbarPage @toggleSidebar="sidebarOpen = !sidebarOpen" />
        <router-view />
      </div>
    </div>

    <!-- Halaman login -->
    <div v-else>
      <router-view />
      <router-view :key="$route.fullPath" />

    </div>
  </div>
</template>

<script>
import SidebarPage from './components/SidebarPage.vue'
import NavbarPage from './components/NavbarPage.vue'

export default {
  components: {
    SidebarPage,
    NavbarPage,
  },
  data() {
    return {
      sidebarOpen: false,
      currentRouteName: this.$route.name,
      isMobile: false,
    }
  },
  computed: {
    isLoginPage() {
      return this.currentRouteName === 'LoginPage'
    }
  },
  watch: {
    '$route.name'(newVal) {
      this.currentRouteName = newVal
    }
  },
  mounted() {
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile)
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth < 768
      if (this.isMobile) this.sidebarOpen = false
    }
  }
}
</script>

<style scoped>
/* Tambahkan transisi sidebar jika diperlukan */
</style>
