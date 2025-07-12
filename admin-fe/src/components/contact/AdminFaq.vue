<template>
  <div class="max-w-full mx-auto p-4 space-y-6">
    <h2 class="text-xl font-bold">Kelola FAQ Section</h2>

    <div class="space-y-2">
      <label>Judul</label>
      <input v-model="form.title" class="input" type="text" :disabled="!isAdmin" />

      <label>Subjudul</label>
      <input v-model="form.subtitle" class="input" type="text" :disabled="!isAdmin" />

      <label>CTA Text</label>
      <input v-model="form.ctaText" class="input" type="text" :disabled="!isAdmin" />

      <label>CTA Link</label>
      <input v-model="form.ctaLink" class="input" type="text" :disabled="!isAdmin" />
    </div>

    <hr />

    <div>
      <h3 class="font-semibold mb-2">Pertanyaan dan Jawaban</h3>
      <div
        v-for="(faq, i) in form.faqs"
        :key="i"
        class="border p-3 mb-3 rounded"
      >
        <label>Pertanyaan</label>
        <input
          v-model="faq.question"
          class="input mb-2"
          :disabled="!isAdmin"
        />

        <label>Jawaban</label>
        <textarea
          v-model="faq.answer"
          class="input"
          :disabled="!isAdmin"
        ></textarea>

        <button
          v-if="isAdmin"
          @click="removeFaq(i)"
          class="text-red-500 text-sm mt-1"
        >
          Hapus
        </button>
      </div>

      <button
        v-if="isAdmin"
        @click="addFaq"
        class="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600"
      >
        + Tambah FAQ
      </button>
    </div>

    <button
      v-if="isAdmin"
      @click="saveData"
      class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Simpan
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

const isAdmin = ref(false)

const form = ref({
  title: '',
  subtitle: '',
  ctaText: '',
  ctaLink: '',
  faqs: []
})

const fetchData = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.faqsSection)
    form.value = res.data
  } catch (err) {
    console.error('Gagal memuat FAQ section:', err)
  }
}

const addFaq = () => {
  form.value.faqs.push({ question: '', answer: '' })
}

const removeFaq = (i) => {
  form.value.faqs.splice(i, 1)
}

const saveData = async () => {
  try {
    await axios.put(API_ENDPOINTS.faqsSection, form.value)
    alert('Data berhasil disimpan')
  } catch (err) {
    alert('Gagal menyimpan data')
    console.error(err)
  }
}

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  isAdmin.value = user?.role === 'admin'
  fetchData()
})
</script>

<style scoped>
.input {
  @apply border rounded px-3 py-2 w-full;
}
</style>
