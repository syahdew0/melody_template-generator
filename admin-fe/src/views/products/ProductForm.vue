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
  v-if="isEditorReady"
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

        
         <!-- Product Details -->
        <div class="border border-gray-300 p-4 rounded shadow">
          <h3 class="font-semibold mb-2">Product Details</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
  <label>Price</label>
  <input
    type="text"
    class="input border border-gray-400 focus:border-black focus:ring focus:ring-black/10 rounded w-full px-2 py-1"
    :value="formattedPrice"
    @input="onPriceInput($event.target.value)"
  />
</div>


<!-- <div>
  <label>Discount %</label>
  <input v-model.number="form.product_detail.discount_percentage" type="number" min="0" max="100"
    class="input border border-gray-400 focus:border-black focus:ring focus:ring-black/10 rounded w-full px-2 py-1" />
</div> -->
<div>
  <label>Price After Discount</label>
  <input
    type="text"
    :value="formattedDiscountPrice"
    @input="onDiscountPriceInput($event.target.value)"
    class="input border border-gray-400 rounded w-full px-2 py-1"
  />
</div>
            <div>
              <label>Discount Until</label>
              <input v-model="form.product_detail.discount_until" type="datetime-local"
                class="input border border-gray-400 focus:border-black focus:ring focus:ring-black/10 rounded w-full px-2 py-1" />
            </div>
            <div>
              <label>Weight</label>
              <input v-model.number="form.product_detail.weight" type="number"
                class="input border border-gray-400 focus:border-black focus:ring focus:ring-black/10 rounded w-full px-2 py-1" />
            </div>
            <div>
              <label>Unit Name</label>
              <input v-model="form.product_detail.unit_name" type="text"
                class="input border border-gray-400 focus:border-black focus:ring focus:ring-black/10 rounded w-full px-2 py-1" />
            </div>
            <div>
              <label>Purchase Price</label>
              <input v-model.number="form.product_detail.purchase_price" type="number"
                class="input border border-gray-400 focus:border-black focus:ring focus:ring-black/10 rounded w-full px-2 py-1" />
            </div>
            <div>
              <label>Admin Info</label>
              <textarea v-model="form.product_detail.admin_info" rows="2"
                class="input border border-gray-400 focus:border-black focus:ring focus:ring-black/10 rounded w-full px-2 py-1"></textarea>
            </div>
            <div>
              <label>Formula Price</label>
              <input v-model="form.product_detail.formula_price" type="text"
                class="input border border-gray-400 focus:border-black focus:ring focus:ring-black/10 rounded w-full px-2 py-1" />
            </div>
            <div class="flex items-center space-x-2">
              <input type="checkbox" v-model="form.product_detail.is_preorder" class="border border-gray-400" />
              <span>Is Preorder?</span>
            </div>
            <div>
              <label>Product Type</label>
              <select v-model="form.product_detail.product_type_id"
                class="input border border-gray-400 focus:border-black focus:ring focus:ring-black/10 rounded w-full px-2 py-1">
                <option :value="null">Select Type</option>
                <option v-for="type in productTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
              </select>
            </div>
            <div>
              <label>Minimum Quantity</label>
              <input v-model.number="form.product_detail.minimum_qty" type="number"
                class="input border border-gray-400 focus:border-black focus:ring focus:ring-black/10 rounded w-full px-2 py-1" />
            </div>
            <div class="flex items-center space-x-2">
              <input type="checkbox" v-model="form.product_detail.stock_integrated" class="border border-gray-400" />
              <span>Stock Integrated?</span>
            </div>
            <div>
              <label>Stock</label>
              <input v-model.number="form.product_detail.stock" type="number"
                class="input border border-gray-400 focus:border-black focus:ring focus:ring-black/10 rounded w-full px-2 py-1" />
            </div>
            <div>
              <label>Initial Stock</label>
              <input v-model.number="form.product_detail.initial_stock" type="number"
                class="input border border-gray-400 focus:border-black focus:ring focus:ring-black/10 rounded w-full px-2 py-1" />
            </div>
            <div>
              <label>DP Percentage</label>
              <input v-model.number="form.product_detail.dp_percentage" type="number"
                class="input border border-gray-400 focus:border-black focus:ring focus:ring-black/10 rounded w-full px-2 py-1" />
            </div>
            <div>
              <label>Minimum Order</label>
              <input v-model.number="form.product_detail.minimum_order" type="number"
                class="input border border-gray-400 focus:border-black focus:ring focus:ring-black/10 rounded w-full px-2 py-1" />
            </div>
            <div>
              <label>Dimension</label>
              <input v-model="form.product_detail.dimension" type="text"
                class="input border border-gray-400 focus:border-black focus:ring focus:ring-black/10 rounded w-full px-2 py-1" />
            </div>
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
  v-if="isMediaPickerReady && showMediaPicker"
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
import { ref,computed, onMounted } from 'vue'
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
const isEditorReady = ref(false)
const isMediaPickerReady = ref(false)

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
    discount_percentage: 0,
    discount_price: 0,
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

const formatNumber = (num) => {
  if (!num) return ''
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
const parseNumber = (str) => {
  if (!str) return 0
  return Number(str.toString().replace(/\./g, '')) || 0
}

const formattedPrice = computed(() => formatNumber(form.value.product_detail.price))

const onPriceInput = (val) => {
  form.value.product_detail.price = parseNumber(val)
}
const formattedDiscountPrice = computed(() => {
  return formatNumber(form.value.product_detail.discount_price)
})
const onDiscountPriceInput = (val) => {
  // ubah input jadi number tanpa titik
  form.value.product_detail.discount_price = parseNumber(val)
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

    // format discount_until ke datetime-local (local time)
    if (form.value.product_detail.discount_until) {
    const date = new Date(form.value.product_detail.discount_until)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    form.value.product_detail.discount_until = `${year}-${month}-${day}T${hours}:${minutes}`
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
    isEditorReady.value = true
  isMediaPickerReady.value = true
})

// watch(
//   () => [form.value.product_detail?.price, form.value.product_detail?.discount_percentage],
//   ([price, discount]) => {
//     if (!form.value.product_detail) return
//     form.value.product_detail.discount_price = price && discount
//       ? price - (price * discount / 100)
//       : price
//   }
// )

</script>
