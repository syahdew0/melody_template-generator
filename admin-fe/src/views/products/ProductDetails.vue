<template>
  <div class="border border-gray-300 p-6 rounded-2xl shadow-md bg-white">
    <h3 class="text-xl font-semibold mb-4">Product Details</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Price -->
      <div>
        <label class="block mb-1 font-medium text-gray-700">Price</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
          <input
            :value="formatCurrency(localDetail.price)"
            @input="onCurrencyInput($event, 'price')"
            placeholder="Enter price"
            class="border border-gray-300 rounded-lg w-full pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <!-- Discount Price -->
      <div>
        <label class="block mb-1 font-medium text-gray-700">Price After Discount</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
          <input
            :value="formatCurrency(localDetail.discount_price)"
            @input="onCurrencyInput($event, 'discount_price')"
            placeholder="Enter discount price"
            class="border border-gray-300 rounded-lg w-full pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <!-- Brand Selector -->
      <BrandSelector :brands="brands" v-model="localDetail.brand_id" />

      <!-- Product Type Selector -->
      <ProductTypeSelector v-model="localDetail.product_type_id" />

      <!-- Purchase Price -->
      <div>
        <label class="block mb-1 font-medium text-gray-700">Purchase Price</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
          <input
            :value="formatCurrency(localDetail.purchase_price)"
            @input="onCurrencyInput($event, 'purchase_price')"
            placeholder="Harga beli"
            class="border border-gray-300 rounded-lg w-full pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <!-- Weight -->
      <div>
        <label class="block mb-1 font-medium text-gray-700">Weight (gram)</label>
        <input
          v-model.number="localDetail.weight"
          type="number"
          placeholder="Gram"
          class="border border-gray-300 rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <!-- Unit -->
      <div>
        <label class="block mb-1 font-medium text-gray-700">Unit Name</label>
        <input
          v-model="localDetail.unit_name"
          type="text"
          placeholder="e.g. pcs, kg"
          class="border border-gray-300 rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <!-- Admin Info -->
      <div class="md:col-span-2">
        <label class="block mb-1 font-medium text-gray-700">Admin Info</label>
        <textarea
          v-model="localDetail.admin_info"
          rows="3"
          placeholder="Internal notes for admin"
          class="border border-gray-300 rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        ></textarea>
      </div>

      <!-- Formula Price -->
      <div>
        <label class="block mb-1 font-medium text-gray-700">Formula Price</label>
        <input
          v-model="localDetail.formula_price"
          type="text"
          placeholder="Custom formula"
          class="border border-gray-300 rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <!-- Preorder -->
      <div class="flex items-center mt-5 md:mt-0 space-x-2">
        <input
          type="checkbox"
          v-model="localDetail.is_preorder"
          class="h-4 w-4 border-gray-300 rounded"
        />
        <span class="text-gray-700 font-medium">Is Preorder?</span>
      </div>

      <!-- Variations -->
      <ProductVariations 
        :productId="props.modelValue.post_id || props.modelValue.id"
        :variations="localDetail.variations"
        @update:variations="val => localDetail.variations = val"
      />

      <!-- Stock -->
      <div>
        <label class="block mb-1 font-medium text-gray-700">Stock</label>
        <input
          v-model.number="localDetail.stock"
          type="number"
          placeholder="Jumlah stok"
          class="border border-gray-300 rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <!-- Minimum Qty -->
      <div>
        <label class="block mb-1 font-medium text-gray-700">Minimum Quantity</label>
        <input
          v-model.number="localDetail.minimum_qty"
          type="number"
          placeholder="Minimal pembelian"
          class="border border-gray-300 rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <!-- Stock Integrated -->
      <div class="flex items-center mt-5 md:mt-0 space-x-2">
        <input
          type="checkbox"
          v-model="localDetail.stock_integrated"
          class="h-4 w-4 border-gray-300 rounded"
        />
        <span class="text-gray-700 font-medium">Stock Integrated?</span>
      </div>

      <!-- Initial Stock -->
      <div>
        <label class="block mb-1 font-medium text-gray-700">Initial Stock</label>
        <input
          v-model.number="localDetail.initial_stock"
          type="number"
          placeholder="Stok awal"
          class="border border-gray-300 rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <!-- DP -->
      <div>
        <label class="block mb-1 font-medium text-gray-700">DP Percentage</label>
        <input
          v-model.number="localDetail.dp_percentage"
          type="number"
          placeholder="e.g. 30"
          class="border border-gray-300 rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <!-- Minimum Order -->
      <div>
        <label class="block mb-1 font-medium text-gray-700">Minimum Order</label>
        <input
          v-model.number="localDetail.minimum_order"
          type="number"
          placeholder="Minimal order"
          class="border border-gray-300 rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <!-- Dimension -->
      <div class="md:col-span-2">
        <label class="block mb-1 font-medium text-gray-700">Dimension</label>
        <input
          v-model="localDetail.dimension"
          type="text"
          placeholder="e.g. 10x20x30 cm"
          class="border border-gray-300 rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import ProductTypeSelector from '@/views/products/ProductTypeSelector.vue'
import ProductVariations from '@/views/products/ProductVariations.vue'
import BrandSelector from '@/views/products/BrandSelector.vue'

/*global defineEmits defineProps*/
const props = defineProps({
  modelValue: { type: Object, required: true }
})
const emit = defineEmits(['update:modelValue'])
const localDetail = reactive({ ...props.modelValue })

// Format Rupiah helper
const formatCurrency = (val) => {
  if (val == null || val === '') return ''
  return new Intl.NumberFormat('id-ID').format(val)
}

// Saat input berubah
const onCurrencyInput = (e, field) => {
  const raw = e.target.value.replace(/[^\d]/g, '')
  localDetail[field] = Number(raw || 0)
  e.target.value = formatCurrency(raw)
}

// Sinkronisasi dari parent ke child
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) Object.assign(localDetail, newVal)
  },
  { deep: true }
)

// Emit ke parent bila ada perubahan
watch(
  localDetail,
  (newVal) => {
    emit('update:modelValue', newVal)
  },
  { deep: true }
)
</script>
