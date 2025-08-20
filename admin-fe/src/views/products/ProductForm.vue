<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold">{{ isEdit ? 'Edit Product' : 'Add New Product' }}</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Main Form -->
      <div class="md:col-span-2 space-y-4">
        <div>
          <label class="block mb-1 font-medium">Product Title</label>
          <input v-model="form.title" @input="generateSlug" type="text" class="input" />
        </div>

        <div>
          <label class="block mb-1 font-medium">Slug</label>
          <input v-model="form.slug" type="text" class="input" />
        </div>

        <div>
          <label class="block mb-1 font-medium">Content</label>
          <quill-editor
            v-model="form.content"
            :style="{ minHeight: '200px' }"
            class="bg-white"
          />
        </div>

        <div>
          <label class="block mb-1 font-medium">Excerpt</label>
          <textarea v-model="form.excerpt" rows="3" class="input"></textarea>
        </div>

        <!-- SEO -->
        <div class="border p-4 rounded shadow">
          <h3 class="font-semibold mb-2">SEO Settings</h3>
          <label class="block text-sm">Meta Title</label>
          <input v-model="seo.meta_title" type="text" class="input mb-2" />

          <label class="block text-sm">Meta Description</label>
          <input v-model="seo.meta_description" type="text" class="input mb-2" />

          <label class="block text-sm">Meta Keywords</label>
          <input v-model="seo.meta_keywords" type="text" class="input" />
        </div>

        <!-- Product Detail -->
        <div class="border p-4 rounded shadow">
          <h3 class="font-semibold mb-2">Product Details</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm">Price</label>
              <input v-model.number="form.product_detail.price" type="number" class="input" />
            </div>
            <div>
              <label class="block text-sm">Discount Price</label>
              <input v-model.number="form.product_detail.discount_price" type="number" class="input" />
            </div>
            <div>
              <label class="block text-sm">Discount Until</label>
              <input 
                v-model="form.product_detail.discount_until" 
                type="datetime-local" 
                class="input" 
              />
            </div>
            <div>
              <label class="block text-sm">Weight</label>
              <input v-model.number="form.product_detail.weight" type="number" class="input" />
            </div>
            <div>
              <label class="block text-sm">Unit Name</label>
              <input v-model="form.product_detail.unit_name" type="text" class="input" />
            </div>
            <!-- Tambahkan field lain sesuai kebutuhan -->
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-4">
        <!-- Thumbnail -->
        <div class="bg-white border rounded shadow-sm p-4">
          <h3 class="font-semibold mb-2">Featured Image</h3>
          <button
            class="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
            @click="showMediaPicker = true"
          >
            Select Image
          </button>

          <div v-if="form.thumbnail_url" class="mt-3">
            <img
              :src="getImageUrl(form.thumbnail_url)"
              alt="Thumbnail"
              class="rounded shadow max-h-40 object-cover w-full"
            />
            <button
              @click="form.thumbnail_url = ''"
              class="mt-2 text-sm text-red-600 hover:underline"
            >
              Remove Image
            </button>
          </div>

          <MediaPickerModal
            :show="showMediaPicker"
            @close="showMediaPicker = false"
            @select="selectImage"
          />
        </div>

        <!-- Category -->
        <div class="border p-4 rounded shadow">
          <h3 class="font-semibold mb-2">Categories</h3>
          <div v-for="cat in categories" :key="cat.id" class="flex items-center space-x-2">
            <input type="checkbox" :value="cat.id" v-model="form.category_ids" />
            <label>{{ cat.name }}</label>
          </div>
        </div>

        <!-- Status -->
        <div class="border p-4 rounded shadow space-y-2">
          <label class="block font-medium">Status</label>
          <select v-model="form.status" class="input">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <button @click="submit" class="btn-primary w-full">{{ isEdit ? 'Update' : 'Publish' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { QuillEditor } from '@vueup/vue-quill'
import { API_ENDPOINTS } from '@/config/api'
import { useToast } from 'vue-toastification'
import MediaPickerModal from '@/views/MediaPicker.vue'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const isEdit = !!route.params.id

const form = ref({
  website_id: 1,
  user_id: JSON.parse(localStorage.getItem('user'))?.id || 1,
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  thumbnail_url: '',
  status: 'draft',
  type: 'product',
  template: '',
  parent_id: null,
  category_ids: [],
  product_detail: {
    price: 0,
    discount_price: null,
    discount_until: null,
    weight: 0,
    unit_name: '',
    purchase_price: null,
    admin_info: '',
    formula_price: '',
    is_preorder: false,
    product_type_id: null,
    minimum_qty: null,
    stock_integrated: false,
    stock: 0,
    initial_stock: null,
    dp_percentage: null,
    minimum_order: null,
    dimension: ''
  }
})

const seo = ref({
  meta_title: '',
  meta_description: '',
  meta_keywords: ''
})

const categories = ref([])
const showMediaPicker = ref(false)

const generateSlug = () => {
  form.value.slug = form.value.title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

const getImageUrl = (path) => path.startsWith('http') ? path : `${API_ENDPOINTS.media}${path}`

const selectImage = (url) => {
  form.value.thumbnail_url = url
  showMediaPicker.value = false
}

const fetchProduct = async () => {
  try {
    const { data } = await axios.get(`${API_ENDPOINTS.posts}/${route.params.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })

    // isi form utama
    form.value = {
      ...form.value,
      title: data.title || '',
      slug: data.slug || '',
      content: data.content || '',
      excerpt: data.excerpt || '',
      thumbnail_url: data.thumbnail_url || '',
      status: data.status || 'draft',
      category_ids: data.post_categories?.map(pc => pc.category.id) || [],
      product_detail: { ...form.value.product_detail, ...data.product_detail }
    }

    // format discount_until ke datetime-local
    if (form.value.product_detail.discount_until) {
      form.value.product_detail.discount_until = new Date(
        form.value.product_detail.discount_until
      ).toISOString().slice(0, 16)
    }

    // meta
    if (data.meta?.length) {
      seo.value.meta_title = data.meta.find(m => m.meta_key === 'meta_title')?.meta_value || ''
      seo.value.meta_description = data.meta.find(m => m.meta_key === 'meta_description')?.meta_value || ''
      seo.value.meta_keywords = data.meta.find(m => m.meta_key === 'meta_keywords')?.meta_value || ''
    }
  } catch (err) {
    console.error(err)
    toast.error('Failed to fetch product data.')
  }
}

const fetchCategories = async () => {
  try {
    const { data } = await axios.get(API_ENDPOINTS.categories)
    categories.value = data
  } catch (err) {
    console.error(err)
  }
}

const submit = async () => {
  try {
    const payload = {
      ...form.value,
      product_detail: {
        ...form.value.product_detail,
        discount_until: form.value.product_detail.discount_until
          ? new Date(form.value.product_detail.discount_until).toISOString()
          : null
      },
      meta: [
        { meta_key: 'meta_title', meta_value: seo.value.meta_title },
        { meta_key: 'meta_description', meta_value: seo.value.meta_description },
        { meta_key: 'meta_keywords', meta_value: seo.value.meta_keywords }
      ]
    }

    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }

    if (isEdit) {
      await axios.put(`${API_ENDPOINTS.posts}/${route.params.id}`, payload, { headers })
      toast.success('Product updated successfully.')
    } else {
      await axios.post(API_ENDPOINTS.posts, payload, { headers })
      toast.success('Product created successfully.')
    }

    router.push({ name: 'ProductList' })
  } catch (err) {
    console.error(err)
    toast.error('Failed to save product.')
  }
}

onMounted(async () => {
  await fetchCategories()
  if (isEdit) await fetchProduct()
})
</script>
