<template>
  <div class="max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow-md mt-10">
    <h2 class="text-3xl font-bold text-gray-800 mb-6">Kelola Testimoni Klien</h2>

    <p v-if="!isAdmin" class="text-sm text-red-500 mb-4">
      hanya admin yang dapat <strong>mengedit</strong> dan mengubah konten.
    </p>
    
    <!-- Header -->
    <div class="mb-8">
      <label class="block text-sm font-semibold text-gray-700 mb-1">Judul Section</label>
      <input v-model="section.title" class="input w-full mb-4" placeholder="Judul section" :readonly="!isAdmin" />

      <label class="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
      <textarea v-model="section.description" class="input w-full" rows="3" placeholder="Deskripsi..." :readonly="!isAdmin"></textarea>
    </div>

    <!-- Testimoni List -->
    <div class="space-y-6">
      <div
        v-for="(testimonial, index) in section.testimonials"
        :key="index"
        class="p-4 border border-gray-200 rounded-lg bg-gray-50"
      >
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-semibold text-gray-700">Testimoni {{ index + 1 }}</h3>
          <button v-if="isAdmin" @click="removeTestimonial(index)" class="text-red-500 hover:underline text-sm">Hapus</button>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <input v-model="testimonial.name" class="input w-full" placeholder="Nama Klien" :readonly="!isAdmin" />
          <input v-model="testimonial.job" class="input w-full" placeholder="Pekerjaan" :readonly="!isAdmin" />
        </div>

        <textarea v-model="testimonial.quote" class="input w-full mt-3" rows="2" placeholder="Kutipan Testimoni" :readonly="!isAdmin"></textarea>

        <!-- Avatar -->
        <div class="mt-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">URL Foto Klien (avatar)</label>
          <div class="flex items-center space-x-2">
            <input
              v-model="testimonial.avatar"
              class="input flex-1"
              placeholder="URL avatar"
              type="text"
              :readonly="!isAdmin"
            />
            <button
              v-if="isAdmin"
              type="button"
              @click="openMediaPicker(index)"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Pilih
            </button>
          </div>
          <div v-if="testimonial.avatar" class="mt-2">
            <img :src="testimonial.avatar" alt="Avatar Preview" class="h-24 rounded border" />
          </div>
        </div>
      </div>
    </div>

    <!-- Tambah Testimoni -->
    <div class="mt-6" v-if="isAdmin">
      <button
        @click="addTestimonial"
        class="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded shadow-sm"
      >
        + Tambah Testimoni
      </button>
    </div>

    <!-- Tombol Simpan -->
    <div class="mt-8" v-if="isAdmin">
      <button
        @click="saveSection"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded shadow-md"
      >
        Simpan Semua Perubahan
      </button>
    </div>

    <!-- MediaPicker Modal -->
    <MediaPicker
      v-if="showMediaPicker"
      :show="showMediaPicker"
      @select="onMediaSelected"
      @close="showMediaPicker = false"
    />
  </div>
</template>

<script>
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'
import MediaPicker from '@/components/MediaPicker.vue'

export default {
  name: "AdminTestimonials",
  components: { MediaPicker },
  data() {
    return {
      section: {
        title: "",
        description: "",
        testimonials: [],
      },
      isAdmin: false,
      showMediaPicker: false,
      mediaPickerIndex: null,
    };
  },
  mounted() {
    this.checkRole()
    this.fetchData()
  },
  methods: {
    checkRole() {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      this.isAdmin = user?.role === 'admin'
    },
    fetchData() {
      axios.get(API_ENDPOINTS.testimonials)
        .then((res) => {
          this.section.testimonials = res.data.testimonials
          this.section.title = "Apa Kata Klien Kami"
          this.section.description = "Testimoni dari klien terbaik kami."
        })
        .catch((err) => {
          console.error("Gagal memuat data testimonial:", err)
          alert("Gagal memuat data testimonial.")
        })
    },
    addTestimonial() {
      this.section.testimonials.push({
        name: "",
        job: "",
        quote: "",
        avatar: "",
      })
    },
    removeTestimonial(index) {
      this.section.testimonials.splice(index, 1)
    },
    saveSection() {
      axios.post(API_ENDPOINTS.testimonials, this.section)
        .then(() => alert("Data berhasil disimpan"))
        .catch((err) => {
          console.error("Gagal menyimpan:", err)
          alert("Gagal menyimpan testimoni")
        })
    },
    openMediaPicker(index) {
      this.mediaPickerIndex = index
      this.showMediaPicker = true
    },
    onMediaSelected(url) {
      if (this.mediaPickerIndex !== null) {
        this.section.testimonials[this.mediaPickerIndex].avatar = url
        this.showMediaPicker = false
        this.mediaPickerIndex = null
      }
    },
  },
};
</script>

<style scoped>
.input {
  @apply border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500;
}
</style>
