<template>
  <div class="space-y-6 py-6 max-w-full">
    <h3 class="text-xl font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
      <span class="inline-block w-1 h-5 bg-blue-600 rounded"></span>
      Variasi Produk
    </h3>

    <!-- Tambah Atribut -->
    <div class="flex flex-col sm:flex-row gap-2 mb-4">
      <input
        v-model="newAttribute"
        placeholder="Nama atribut (contoh: Warna, Ukuran)"
        class="border border-gray-300 rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      <button
        @click="addAttributeHandler"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all mt-2 sm:mt-0"
      >
        + Tambah
      </button>
    </div>

    <!-- Daftar Atribut -->
    <div
      v-for="(attr, idx) in attributes"
      :key="idx"
      class="p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all"
    >
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
        <h4 class="font-semibold text-gray-700">{{ attr.name }}</h4>
        <button
          @click="removeAttribute(idx)"
          class="text-red-500 text-sm hover:underline"
        >
          Hapus
        </button>
      </div>

      <!-- Tambah Opsi -->
      <div class="flex flex-col sm:flex-row gap-2 mb-3">
        <input
          v-model="newOption[idx]"
          placeholder="Tambah opsi (misal: Merah)"
          class="border border-gray-300 rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
        <button
          @click="addOption(idx)"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
        >
          Tambah
        </button>
      </div>

      <!-- Daftar Opsi -->
      <div class="flex flex-wrap gap-2">
        <span
          v-for="(opt, optIdx) in attr.options"
          :key="optIdx"
          class="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm"
        >
          {{ opt }}
          <button
            @click="removeOption(idx, optIdx)"
            class="text-red-500 hover:text-red-700 font-bold"
          >
            ×
          </button>
        </span>
      </div>
    </div>

    <!-- Kombinasi Variasi -->
    <div v-if="combinations.length" class="mt-8">
      <h4 class="font-semibold text-gray-800 mb-3 text-lg border-b pb-2">
        Kombinasi Otomatis
      </h4>

      <div class="overflow-auto border border-gray-200 rounded-xl bg-white shadow-sm">
        <table class="min-w-[800px] md:min-w-full text-sm text-gray-700">
          <thead class="bg-gray-100 border-b sticky top-0 z-10">
            <tr>
              <th v-for="attr in attributes" :key="attr.name" class="px-4 py-3 text-left font-semibold whitespace-nowrap">
                {{ attr.name }}
              </th>
              <th class="px-4 py-3 font-semibold">Harga</th>
              <th class="px-4 py-3 font-semibold">Stok</th>
              <th class="px-4 py-3 font-semibold">Gambar</th>
            </tr>
          </thead>

         <tbody>
          <tr v-for="(combo, i) in combinations" :key="i" class="border-t hover:bg-gray-50 transition-colors">
            <td v-for="attr in attributes" :key="attr.name" class="px-4 py-2 capitalize whitespace-nowrap">
              {{ getValueByOption(combo, attr.name) }}
            </td>
            <td class="px-4 py-2">
              <input type="number" v-model.number="combo.price" class="border border-gray-300 rounded-lg px-2 py-1 w-24" min="0" />
            </td>
            <td class="px-4 py-2">
              <input type="number" v-model.number="combo.stock" class="border border-gray-300 rounded-lg px-2 py-1 w-20" min="0" />
            </td>
            <td class="px-4 py-2 flex items-center gap-2">
              <button
                class="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-lg border border-gray-300"
                @click="openMediaPicker(combo)"
              >
                Select Image
              </button>
              <img v-if="combo.image" :src="getImageUrl(combo.image)" class="w-16 h-16 object-cover rounded-lg border border-gray-300" />
              <button v-if="combo.image" @click="removeImage(combo)" class="text-red-500 text-xs hover:underline">
                Remove
              </button>
            </td>
          </tr>
         </tbody>
        </table>
      </div>

      <div class="mt-6">
        <button
          @click="saveCombinations"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
        >
          Simpan Variants
        </button>
      </div>
    </div>

    <MediaPickerModal
      v-if="showMediaPicker && selectedCombo"
      :show="showMediaPicker"
      @close="closeMediaPicker"
      @select="selectComboImage"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'
import MediaPickerModal from '@/views/MediaPicker.vue'
import { API_ENDPOINTS } from '@/config/api'

/*global defineEmits defineProps*/
const props = defineProps({
  modelValue: { type: Object, default: () => ({ variants: [] }) },
  productId: { type: [Number, String], required: true }
})
const emit = defineEmits(['update:modelValue'])

const attributes = ref([])
const newAttribute = ref('')
const newOption = ref([])
const combinations = ref([])
const showMediaPicker = ref(false)
const selectedCombo = ref(null)
// let initialLoad = true

const getValueByOption = (combo, attrName) => combo.values.find(v => v.option === attrName)?.value || ''
const getImageUrl = (path) => path?.startsWith('http') ? path : path
const emitUpdate = () => emit('update:modelValue', combinations.value)

const generateCombinations = (defaultPrice = 0, defaultStock = 0) => {
  if (!attributes.value.length || attributes.value.some(a => a.options.length === 0)) return
  const optionNames = attributes.value.map(a => a.name)
  const optionSets = attributes.value.map(a => a.options)
  const combine = (arrays, optionNames) =>
    arrays.reduce(
      (acc, curr, idx) =>
        acc.flatMap(a => curr.map(b => [...a, { value: b, option: optionNames[idx] }])),
      [[]]
    )
  const allCombos = combine(optionSets, optionNames)

  // Simpan kombinasi lama berdasarkan key unik
  const oldMap = new Map(combinations.value.map(c => [c.values.map(v => v.value).join('|'), c]))
  combinations.value = allCombos.map(values => oldMap.get(values.map(v => v.value).join('|')) || { values, price: defaultPrice, stock: defaultStock, image: null })
}

const addAttributeHandler = () => {
  const name = newAttribute.value.trim()
  if (!name) return
  attributes.value.push({ name, options: [] })
  newOption.value.push('')
  newAttribute.value = ''
}

const removeAttribute = (idx) => {
  attributes.value.splice(idx, 1)
  newOption.value.splice(idx, 1)
  generateCombinations()
}

const addOption = (idx) => {
  const val = newOption.value[idx]?.trim()
  if (!val) return
  attributes.value[idx].options.push(val)
  newOption.value[idx] = ''
  generateCombinations()
}

const removeOption = (attrIdx, optIdx) => {
  attributes.value[attrIdx].options.splice(optIdx, 1)
  generateCombinations()
}

const openMediaPicker = (combo) => { selectedCombo.value = combo; showMediaPicker.value = true }
const closeMediaPicker = () => { showMediaPicker.value = false; selectedCombo.value = null }
const selectComboImage = (url) => { if (selectedCombo.value) selectedCombo.value.image = url; emitUpdate(); closeMediaPicker() }
const removeImage = (combo) => { combo.image = null; emitUpdate() }

const fetchVariants = async () => {
  if (!props.productId) return
  try {
    const res = await axios.get(API_ENDPOINTS.productVariants.list(props.productId))
    const variantsFromBackend = res.data?.data || []

    // Buat map berdasarkan kombinasi unik
    const comboMap = new Map()
    variantsFromBackend.forEach(v => {
      const key = (v.values || []).map(val => val.value).join('|')
      if (!comboMap.has(key)) {
        comboMap.set(key, {
          id: v.id,
          values: (v.values || []).map(val => ({ value: val.value, option: val.option })),
          price: Number(v.price || 0),
          stock: Number(v.stock || 0),
          image: v.image || null
        })
      }
    })

    combinations.value = Array.from(comboMap.values())

    // Generate attributes unik dari variants
    const attrMap = {}
    combinations.value.forEach(c => {
      c.values.forEach(v => {
        if (!attrMap[v.option]) attrMap[v.option] = new Set()
        attrMap[v.option].add(v.value)
      })
    })
    attributes.value = Object.entries(attrMap).map(([name, set]) => ({ name, options: Array.from(set) }))
    newOption.value = attributes.value.map(() => '')

    emitUpdate()
  } catch (err) {
    console.error('Gagal fetch variants:', err)
  }
}

// ==== Simpan kombinasi ke backend ====
const saveCombinations = async () => {
  if (!props.productId) return
  try {
    const payload = combinations.value.map(c => ({
      id: c.id || null, // untuk update jika ada id
      values: c.values.map(v => ({ option: v.option, value: v.value })),
      price: c.price,
      stock: c.stock,
      image: c.image
    }))

    const res = await axios.post(API_ENDPOINTS.productVariants.createCombinations(props.productId), { variants: payload })
    console.log('Variants saved:', res.data)
    await fetchVariants() // refresh setelah save
    alert('Variants berhasil disimpan')
  } catch (err) {
    console.error('Gagal simpan variants:', err)
    alert(err.response?.data?.message || err.message)
  }
}

onMounted(fetchVariants)

watch(() => props.productId, (newId) => {
  if (newId) fetchVariants()
})
</script>
