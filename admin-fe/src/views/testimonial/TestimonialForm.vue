<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 font-['Poppins']">
    <!-- Konten Utama -->
    <div class="lg:col-span-2 space-y-5">
      <!-- Judul -->
      <div>
        <label class="block font-semibold text-gray-700 mb-1">Judul Testimoni</label>
        <input
          v-model="form.title"
          @input="generateSlug"
          placeholder="Masukkan judul testimonial"
          class="w-full text-3xl font-bold border-none focus:ring-0 placeholder-gray-400"
        />
      </div>

      <!-- Ringkasan -->
      <div>
        <label class="block font-semibold text-gray-700 mb-1">Ringkasan</label>
        <textarea
          v-model="form.excerpt"
          placeholder="Tulis ringkasan singkat testimoni"
          class="w-full text-sm text-gray-600 border border-dashed rounded p-3"
          rows="2"
        ></textarea>
      </div>

      <!-- Isi -->
      <div class="bg-white border rounded shadow-sm p-4">
        <label class="block font-semibold text-gray-700 mb-2">Isi Testimoni</label>
        <QuillEditor
          v-model:content="form.content"
          contentType="html"
          class="min-h-[250px] bg-white border rounded"
        />
      </div>

      <!-- Nama & Jabatan -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Nama Klien</label>
          <input
            v-model="form.author_name"
            placeholder="Nama pemberi testimoni"
            class="w-full border rounded p-2 text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Jabatan / Perusahaan</label>
          <input
            v-model="form.author_position"
            placeholder="Jabatan atau perusahaan"
            class="w-full border rounded p-2 text-sm"
          />
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="space-y-5">
      <!-- Status -->
      <div class="bg-white border rounded shadow-sm p-4">
        <h3 class="font-semibold mb-2">Status</h3>
        <select v-model="form.status" class="w-full border p-2 rounded">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <!-- Foto Klien -->
      <div class="bg-white border rounded shadow-sm p-4">
        <h3 class="font-semibold mb-2">Foto Klien</h3>
        <button
          class="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
          @click="showMediaPicker = true"
        >
          Pilih Foto
        </button>
        <div v-if="form.image" class="mt-3">
          <img
            :src="getImageUrl(form.image)"
            alt="Foto Klien"
            class="rounded shadow max-h-40 object-cover w-full"
          />
          <button
            @click="form.image=''"
            class="mt-2 text-sm text-red-600 hover:underline"
          >
            Hapus Foto
          </button>
        </div>
        <MediaPickerModal
          :show="showMediaPicker"
          @close="showMediaPicker=false"
          @select="selectImage"
        />
      </div>

      <!-- SEO -->
      <div class="bg-white border rounded shadow-sm p-4">
        <h3 class="font-semibold mb-2">SEO</h3>
        <label class="block text-sm font-medium mb-1">Meta Title</label>
        <input
          v-model="seo.meta_title"
          placeholder="Meta Title"
          class="w-full p-2 border rounded mb-2"
        />
        <label class="block text-sm font-medium mb-1">Meta Description</label>
        <textarea
          v-model="seo.meta_description"
          placeholder="Meta Description"
          class="w-full p-2 border rounded"
          rows="2"
        ></textarea>
      </div>

      <!-- Tombol -->
      <div class="text-right">
        <button
          type="button"
          @click="saveTestimonial"
          class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
        >
          {{ isEdit ? 'Update' : 'Publish' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'
import MediaPickerModal from '@/views/MediaPicker.vue'

export default {
  props: {
    id: { type: [String, Number], default: null }
  },
  components: { QuillEditor, MediaPickerModal },
  data() {
    return {
      form: {
        id: null,
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        author_name: '',
        author_position: '',
        status: 'draft',
        image: '',
        type: 'testimonial',
        type_id: 4,
        website_id: 1,
        user_id: 1
      },
      seo: {
        meta_title: '',
        meta_description: ''
      },
      isEdit: false,
      showMediaPicker: false
    }
  },
mounted() {
  if (this.id) {
    this.fetchTestimonial(this.id)
  }
},
  methods: {
    generateSlug() {
      if (this.form.title) {
        this.form.slug = this.form.title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
      }
    },
    getImageUrl(path) {
      return path?.startsWith('http') ? path : `${API_ENDPOINTS.media}${path}`
    },
    selectImage(url) {
      this.form.image = url
      this.showMediaPicker = false
    },
    async fetchTestimonial(id) {
      try {
        const res = await axios.get(`${API_ENDPOINTS.posts}/${id}`)
        const data = res.data
        this.form = {
          ...data,
          id: data.id,
          type: 'testimonial',
          type_id: 4,
          image: data.thumbnail_url || ''
        }
        if (data.meta?.length) {
          data.meta.forEach(m => {
            if (m.meta_key === 'meta_title') this.seo.meta_title = m.meta_value
            if (m.meta_key === 'meta_description')
              this.seo.meta_description = m.meta_value
          })
        }
        this.isEdit = true
      } catch (err) {
        console.error('Gagal fetch testimonial:', err)
      }
    },
    async saveTestimonial() {
      const meta = [
        { meta_key: 'meta_title', meta_value: this.seo.meta_title },
        { meta_key: 'meta_description', meta_value: this.seo.meta_description }
      ]
      const payload = {
        ...this.form,
        type: 'testimonial',
        type_id: 4,
        thumbnail_url: this.form.image,
        meta
      }

      try {
        if (this.isEdit && this.form.id) {
          await axios.put(`${API_ENDPOINTS.posts}/${this.form.id}`, payload)
        } else {
          await axios.post(API_ENDPOINTS.posts, payload)
        }
        alert('Testimonial berhasil disimpan')
        this.$router.push('/admin/testimonials')
      } catch (err) {
        console.error('Gagal simpan testimonial:', err.response?.data || err)
      }
    }
  }
}
</script>
