<!-- <template>
    <div class="p-4">
      <h2 class="text-xl font-semibold mb-4">Manajemen Slider</h2>
  
      <form @submit.prevent="handleSubmit" class="grid gap-3 mb-6">
        <input v-model="form.image_url" placeholder="URL Gambar" class="input" />
        <input v-model="form.title" placeholder="Judul" class="input" />
        <input v-model="form.description" placeholder="Deskripsi" class="input" />
        <select v-model="form.type" class="input">
          <option value="" disabled>Pilih Tipe</option>
          <option value="blog">Blog</option>
          <option value="product">Produk</option>
        </select>
        <input v-model="form.target_id" placeholder="ID Target" class="input" />
        <button class="btn-primary" type="submit">
          {{ form.id ? 'Update' : 'Tambah' }} Slider
        </button>
      </form>
  
      <table class="w-full table-auto border">
        <thead class="bg-gray-200">
          <tr>
            <th>Gambar</th>
            <th>Judul</th>
            <th>Tipe</th>
            <th>Target ID</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in sliders" :key="item.id">
            <td><img :src="item.image_url" class="w-24" /></td>
            <td>{{ item.title }}</td>
            <td>{{ item.type }}</td>
            <td>{{ item.target_id }}</td>
            <td>
              <button @click="editSlide(item)" class="text-blue-600 mr-2">Edit</button>
              <button @click="deleteSlide(item.id)" class="text-red-600">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  
  const sliders = ref([])
  const form = ref({
    id: null,
    image_url: '',
    title: '',
    description: '',
    type: '',
    target_id: '',
  })
  
  const fetchSliders = async () => {
    const res = await axios.get('/api/AdminSliders')
    sliders.value = res.data
  }
  
  const handleSubmit = async () => {
    if (form.value.id) {
      await axios.put(`/api/sliders/${form.value.id}`, form.value)
    } else {
      await axios.post('/api/sliders', form.value)
    }
    form.value = { id: null, image_url: '', title: '', description: '', type: '', target_id: '' }
    fetchSliders()
  }
  
  const editSlide = (item) => {
    form.value = { ...item }
  }
  
  const deleteSlide = async (id) => {
    await axios.delete(`/api/sliders/${id}`)
    fetchSliders()
  }
  
  onMounted(() => {
    fetchSliders()
  })
  </script>
  
  <style scoped>
  .input {
    @apply border p-2 rounded w-full;
  }
  .btn-primary {
    @apply bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700;
  }
  </style>
   -->