<template>
  <div class="p-6 bg-white w-full max-w-full mx-auto">
    <h2 class="text-2xl font-bold mb-6">{{ isEdit ? 'Edit Brand' : 'Add / Select Brand' }}</h2>

    <!-- Dropdown pilih brand -->
    <div class="mb-4">
      <label class="block font-medium mb-1">Select Brand</label>
      <select
        v-model="selectedBrandId"
        @change="onBrandChange"
        class="input w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        <option value="">-- New Brand --</option>
        <option 
          v-for="brand in brands" 
          :key="brand.id" 
          :value="brand.id"
        >
          {{ brand.name }}
        </option>
      </select>
    </div>

    <!-- Brand Name -->
    <div class="mb-4">
      <label class="block font-medium mb-1">Brand Name</label>
      <input
        v-model="localBrand.name"
        @input="generateSlug"
        type="text"
        placeholder="Enter brand name"
        class="input w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>

    <!-- Slug -->
    <div class="mb-4">
      <label class="block font-medium mb-1">Slug</label>
      <input
        v-model="localBrand.slug"
        type="text"
        placeholder="Auto-generated from name"
        class="input w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>

    <!-- Status -->
    <div class="mb-4">
      <label class="block font-medium mb-1">Status</label>
      <select
        v-model="localBrand.status"
        class="input w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    <!-- Buttons -->
    <div class="flex space-x-2">
      <button
        @click="submit"
        class="btn-primary px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        {{ isEdit ? 'Update Brand' : 'Add Brand' }}
      </button>
      <button
        @click="resetForm"
        type="button"
        class="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
      >
        Reset
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { API_ENDPOINTS } from '@/config/api'

const toast = useToast()

/*global defineEmits defineProps*/
const props = defineProps({
  modelValue: [String, Number] // brand_id dari parent
})
const emit = defineEmits(['update:modelValue'])

// State
const brands = ref([])
const selectedBrandId = ref('')
const isEdit = ref(false)

const localBrand = reactive({
  id: null,
  name: '',
  slug: '',
  status: 'active'
})

// Watch props untuk sync v-model
watch(
  () => props.modelValue,
  (val) => {
    selectedBrandId.value = val ? Number(val) : ''
  },
  { immediate: true }
)

// Generate slug otomatis
const generateSlug = () => {
  localBrand.slug = localBrand.name.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-')
}

// Reset form
const resetForm = () => {
  localBrand.id = null
  localBrand.name = ''
  localBrand.slug = ''
  localBrand.status = 'active'
  selectedBrandId.value = ''
  isEdit.value = false
  emit('update:modelValue', '')
}

// Fetch semua brand
const fetchBrands = async () => {
  try {
    const { data } = await axios.get(API_ENDPOINTS.brands.list, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })

    // Tambahkan brand yang dipilih jika belum ada di list
    if (selectedBrandId.value && !data.data.find(b => b.id === selectedBrandId.value)) {
      const currentBrand = { ...localBrand, id: selectedBrandId.value }
      brands.value = [currentBrand, ...data.data]
    } else {
      brands.value = data.data
    }
  } catch (err) {
    toast.error('Failed to load brands')
  }
}

// Fetch brand by ID untuk edit
const fetchBrandById = async (id) => {
  try {
    const { data } = await axios.get(API_ENDPOINTS.brands.detail(id), {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    Object.assign(localBrand, data.data)
    selectedBrandId.value = data.data.id
    isEdit.value = true
  } catch (err) {
    toast.error('Failed to fetch brand data.')
  }
}

// Dropdown change
const onBrandChange = async () => {
  emit('update:modelValue', selectedBrandId.value ? Number(selectedBrandId.value) : '')
  if (selectedBrandId.value) {
    await fetchBrandById(selectedBrandId.value)
  } else {
    resetForm()
  }
}

// Submit form
const submit = async () => {
  try {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }
    if (isEdit.value) {
      await axios.put(API_ENDPOINTS.brands.update(selectedBrandId.value), localBrand, { headers })
      toast.success('Brand updated successfully.')
    } else {
      const { data } = await axios.post(API_ENDPOINTS.brands.create, localBrand, { headers })
      toast.success('Brand added successfully.')
      selectedBrandId.value = data.data.id
    }
    await fetchBrands() // reload dropdown setelah tambah/update brand
  } catch (err) {
    toast.error('Failed to save brand: ' + err.message)
  }
}

// Mounted
onMounted(async () => {
  if (props.modelValue) {
    await fetchBrandById(props.modelValue)
  }
  await fetchBrands()
})
</script>
