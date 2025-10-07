<template>
  <div class="md:col-span-2">
    <label class="block font-medium mb-1">Manage Product Types</label>

    <!-- Tambah tipe baru -->
    <div class="flex flex-wrap gap-2 mb-3">
      <input
        v-model="newType.name"
        type="text"
        placeholder="New product type..."
        class="border border-gray-400 rounded px-2 py-1 flex-1"
      />
      <select
        v-model="newType.parent_id"
        class="border border-gray-400 rounded px-2 py-1 w-48"
      >
        <option :value="null">-- No Parent --</option>
        <template v-for="type in flattenedTypes" :key="type.id">
          <option :value="type.id">
            {{ [...type.parentChain.map(id => getTypeName(id)), type.name].join(' > ') }}
          </option>
        </template>
      </select>
      <button
        @click="createType"
        type="button"
        class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
      >
        Add
      </button>
    </div>

    <!-- Select tipe produk -->
    <select
  :value="props.modelValue"
  @change="emit('update:modelValue', $event.target.value)"
      class="border border-gray-400 rounded w-full px-2 py-1"
    >
      <option :value="null">-- Select Type --</option>
      <template v-for="type in flattenedTypes" :key="type.id">
        <option :value="type.id">
          {{ ' '.repeat(type.level * 4) + type.name }}
        </option>
      </template>
    </select>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'
import { useToast } from 'vue-toastification'

/*global defineEmits defineProps*/
const props = defineProps({
  modelValue: [Number, String, null],
})
const emit = defineEmits(['update:modelValue'])

const toast = useToast()
const types = ref([])
const newType = ref({ name: '', parent_id: null })

const fetchTypes = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.productTypes.list, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    types.value = res.data.data
  } catch {
    toast.error('Failed to load product types.')
  }
}

const getTypeName = id => {
  const findType = nodes => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = findType(node.children)
        if (found) return found
      }
    }
    return null
  }
  const type = findType(types.value)
  return type ? type.name : ''
}

const flattenedTypes = computed(() => {
  const result = []
  const traverse = (nodes, level = 0, parentIds = []) => {
    nodes.forEach(n => {
      result.push({ ...n, level, parentChain: [...parentIds] })
      if (n.children?.length) traverse(n.children, level + 1, [...parentIds, n.id])
    })
  }
  traverse(types.value)
  return result
})

const createType = async () => {
  if (!newType.value.name) return
  try {
    await axios.post(API_ENDPOINTS.productTypes.create, newType.value, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    newType.value = { name: '', parent_id: null }
    await fetchTypes()
    toast.success('Product type added.')
  } catch {
    toast.error('Failed to add product type.')
  }
}

onMounted(fetchTypes)
</script>
