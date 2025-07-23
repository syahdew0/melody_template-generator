<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
      <h2 class="text-2xl text-center font-bold mb-6">Melody</h2>

      <!-- Tab Selector -->
      <div class="flex justify-around mb-6">
        <button
          class="font-semibold py-2 px-4 rounded"
          :class="activeTab === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'"
          @click="activeTab = 'login'">
          Login
        </button>
        <!-- <button
          class="font-semibold py-2 px-4 rounded"
          :class="activeTab === 'register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'"
          @click="activeTab = 'register'">
          Register
        </button> -->
      </div>

      <!-- Login Form -->
      <form v-if="activeTab === 'login'" @submit.prevent="submitLogin">
        <input type="email" v-model="login.email" placeholder="Email" class="input-style" required />
        <input type="password" v-model="login.password" placeholder="Password" class="input-style" required />
        <button type="submit" class="btn-primary w-full mt-4">Login</button>
        <p class="mt-2 text-sm text-blue-600 hover:underline text-center cursor-pointer" @click="activeTab = 'forgot'">
          Lupa Password?
        </p>
      </form>

      <!-- Register Form -->
      <form v-if="activeTab === 'register'" @submit.prevent="submitRegister">
        <input type="text" v-model="register.name" placeholder="Nama Lengkap" class="input-style" required />
        <input type="text" v-model="register.username" placeholder="Username" class="input-style" required />
        <input type="email" v-model="register.email" placeholder="Email" class="input-style" required />
        <input type="password" v-model="register.password" placeholder="Password" class="input-style" required />
        <input type="password" v-model="register.confirmPassword" placeholder="Konfirmasi Password" class="input-style" required />
        <button type="submit" class="btn-primary w-full mt-4">Daftar</button>
      </form>

      <!-- Forgot Password Form -->
      <form v-if="activeTab === 'forgot'" @submit.prevent="submitForgot">
        <input type="email" v-model="forgot.email" placeholder="Email" class="input-style" required />
        <button type="submit" class="btn-primary w-full mt-4">Kirim Link Reset</button>
        <p class="text-center mt-4 text-sm text-gray-500">
          <span class="text-blue-600 hover:underline cursor-pointer" @click="activeTab = 'login'">
            Kembali ke Login
          </span>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { API_ENDPOINTS } from '@/config/api'

const router = useRouter()
const activeTab = ref('login')

// Form data
const login = ref({ email: '', password: '' })
const register = ref({ name: '', username: '', email: '', password: '', confirmPassword: '' })
const forgot = ref({ email: '' })

const submitLogin = async () => {
  try {
    const res = await fetch(API_ENDPOINTS.auth.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(login.value),
    })
    const data = await res.json()

    if (!res.ok || !data.token) {
    alert(data.message || 'Login gagal. Coba lagi.')
    return
  }

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({
      role: data.user.role,
      avatar: data.user.avatar || 'https://i.pravatar.cc/100',
    }))

    router.push('/adminDashboard')
  } catch (err) {
    alert(err.message)
  }
}


const submitRegister = async () => {
  if (register.value.password !== register.value.confirmPassword) {
    return alert('Password tidak cocok')
  }

  if (register.value.password.length < 6) {
    return alert('Password minimal 6 karakter')
  }

  if (register.value.username.length < 4) {
    return alert('Username minimal 4 karakter')
  }

  try {
    const { name, username, email, password } = register.value
    const res = await fetch(API_ENDPOINTS.auth.register, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, username, email, password }),
  })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    // Auto login
    const loginRes = await fetch(API_ENDPOINTS.auth.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const loginData = await loginRes.json()
    if (!loginRes.ok) throw new Error(loginData.message)

    localStorage.setItem('token', loginData.token)
    localStorage.setItem('user', JSON.stringify({
      role: loginData.user.role,
      avatar: loginData.user.avatar || 'https://i.pravatar.cc/100',
    }))

    router.push('/adminDashboard')
  } catch (err) {
    alert(err.message)
  }
}

const submitForgot = async () => {
  try {
    const res = await fetch(API_ENDPOINTS.auth.forgotPassword, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(forgot.value),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    alert(data.message)
  } catch (err) {
    alert(err.message)
  }
}

</script>

<style scoped>
.input-style {
  @apply w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 mb-3;
}
.btn-primary {
  @apply bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition;
}
</style>


```{
  "content": {
    "home": {
      "slider": {
        "label": "Slider"
      },
      "why_choose_us": {
        "label": "Why Choose Us"
      },
    },
    "about": {
      "about_us": {
        "label": "About Us"
      },
      "portofolio": {
        "label": "Portofolio"
      },
      "testimonial": {
        "label": "Testimonial"
      }
    }
  } 
}```

"custom_page": {
  "home": {
    "static": {
      "label": "Slider"
      "title": {
        "required": true,
        "type": "content html"
      },
      "content": {
        "required": true,
        "type": "text"
      }
    },
    "badge": {
      "label": "Badge"
      "title": {
        "required": true,
        "type": "text"
      },
      "content": {
        "required": false,
        "type": "text"
      }
    },
    "product_highlight": {
      "label": "Product Highlight"
      "title": {
        "required": true,
        "type": "text"
      },
      "content": {
        "required": true,
        "type": "text"
      }
    },
    "product_item": {
      "label": "Product Item"
      "title": {
        "required": true,
        "type": "text"
      },
      "content": {
        "required": true,
        "type": "text"
      },
      "image": {
        "required": true,
        "type": "text"
      }
    },
  },
} 


id, judul, desk, tag, gambar , created_at, updated_at, createby, updateby, parent id, is active

database, migrat, models, controllers, routes,

get http://localhost:8081/api/content?tag=slider getall / findall
post http://localhost:8081/api/content {judul=tes, ,,,,, tag=slider}
put http://localhost:8081/api/content {id: 2, isactive, judul: tes, ,,,,, tag=slider}
delete http://localhost:8081/api/content/

next 
implementasi ke fe admin lalu ke fe public
implemen untuk dinamis menu berdasarkan skema template 


- colom baru di webstie -> schema(text) isi json schema website
- api utk get website
- tampilkann skema page di ui custom pages


<!-- menjadi list
-> muncul per tag
->tambahkan button add, edit dan save untuk setiap tag

menjadi list
-> muncul per tag
->tambahkan button add, edit dan save untuk setiap tag -->

<!-- // Post.belongsTo(models.Category, {
  //   foreignKey: 'category_id',
  //   as: 'category',
  //   onDelete: 'SET NULL',
  // });
  
  // Category.hasMany(models.Post, {
  //   foreignKey: 'category_id',
  //   as: 'posts',
  // });
  
  //mysql.server start
  
  // Post.hasMany(models.Category, { 
  //   foreignKey: 'post_id',
  //   sourceKey: 'id'
  // });
  // models.Category.belongsTo(Post, { 
  //   foreignKey: 'post_id',
  //   sourceKey: 'id'
  //  }); -->