<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
    
    <!-- Konten Utama -->
    <div class="lg:col-span-2 space-y-4">

      <!-- Listing Type -->
      <div class="mb-4">
        <label class="block font-semibold text-gray-700 mb-1">Listing Type</label>
        <select
          v-model="selectedListingType"
          @change="selectListingType(selectedListingType)"
          class="w-full p-2 border rounded"
        >
          <option value="" disabled>Pilih Listing Type</option>
          <option v-for="type in listingTypes" :key="type.id" :value="type.id">
            {{ type.name }}
          </option>
        </select>
      </div>

      <!-- Title -->
      <div class="mb-4">
        <label class="block font-semibold text-gray-700 mb-1">Title</label>
        <input
          v-model="form.title"
          @input="generateSlug"
          placeholder="Add Title"
          class="w-full text-4xl font-bold border border-gray-300 focus:ring-0 placeholder-gray-400 p-2"
        />
      </div>

      <!-- Excerpt -->
      <div class="mb-4">
        <label class="block font-semibold text-gray-700 mb-1">Excerpt</label>
        <textarea
          v-model="form.excerpt"
          placeholder="Write an excerpt..."
          class="w-full text-sm text-gray-600 border border-dashed rounded p-3"
          rows="2"
        ></textarea>
      </div>

      <!-- Content -->
      <div class="bg-white border rounded shadow-sm p-4 space-y-2 min-h-[300px] mb-4">
        <label class="block font-semibold text-gray-700 mb-1">Content</label>
        <quill-editor
          v-model:content="form.content"
          contentType="html"
          class="min-h-[300px] bg-white border rounded"
        />
      </div>

      <!-- Dynamic Listing Fields -->
      <div
        v-if="selectedListingType && Object.keys(listingForm.additional).length"
        class="bg-white border rounded shadow-sm p-4 mb-4"
      >
        <h3 class="font-semibold mb-2">Listing Fields</h3>
        <div v-for="(value, key) in listingForm.additional" :key="key" class="mb-3">
          <label class="block text-sm font-medium mb-1">{{ key }}</label>
          <input
            v-model="listingForm.additional[key]"
            type="text"
            class="w-full p-2 border rounded"
            :placeholder="key"
          />
        </div>
      </div>
<!-- Price -->
<div v-if="selectedListingType" class="mb-4">
  <label class="block font-semibold text-gray-700 mb-1">Price</label>
  <input
    v-model="listingForm.price"
    type="number"
    placeholder="Enter price"
    class="w-full p-2 border rounded"
  />
</div>

<!-- Kondisi -->
<div v-if="selectedListingType" class="mb-4">
  <label class="block font-semibold text-gray-700 mb-1">Kondisi</label>
  <input
    v-model="listingForm.kondisi"
    type="text"
    placeholder="Enter kondisi"
    class="w-full p-2 border rounded"
  />
</div>

    </div>

    <!-- Sidebar -->
    <div class="space-y-4">
      <!-- Publish, Featured Image, Other Images, SEO, Save Button -->
      <div class="bg-white border rounded shadow-sm p-4">
        <h3 class="font-semibold mb-2">Publish</h3>
        <label class="block text-sm font-medium mb-1">Status</label>
        <select v-model="form.status" class="w-full border p-2 rounded">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div class="bg-white border rounded shadow-sm p-4">
        <h3 class="font-semibold mb-2">Featured Image</h3>
        <button
          class="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
          @click="showMediaPicker = true; pickerTarget = 'thumbnail'"
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
            @click="form.thumbnail_url=''"
            class="mt-2 text-sm text-red-600 hover:underline"
          >
            Remove Image
          </button>
        </div>
      </div>

      <div class="bg-white border rounded shadow-sm p-4">
        <h3 class="font-semibold mb-2">Other Images</h3>
        <button
          class="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
          @click="showMediaPicker = true; pickerTarget = 'other_images'"
        >
          Add Images
        </button>
        <div v-if="form.other_images.length" class="mt-3 grid grid-cols-3 gap-2">
          <div v-for="(img, index) in form.other_images" :key="index" class="relative group">
            <img
              :src="getImageUrl(img)"
              alt="Other Image"
              class="rounded shadow object-cover w-full h-24"
            />
            <button
              @click="removeOtherImage(index)"
              class="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
<!-- Lokasi Listing -->
<div v-if="selectedListingType" class="bg-white border rounded shadow-sm p-4 mb-4">
  <h3 class="font-semibold mb-2">Lokasi Listing</h3>

  <!-- Provinsi -->
  <div class="mb-3">
    <label class="block text-sm font-medium mb-1">Provinsi</label>
    <select v-model="selectedProvince"
      @change="onProvinceChange"
      class="w-full p-2 border rounded">
      <option value="">-- Pilih Provinsi --</option>
      <option v-for="p in provinces" :key="p.id" :value="p.id">
        {{ p.name }}
      </option>
    </select>
  </div>

  <!-- Kabupaten -->
  <div class="mb-3">
    <label class="block text-sm font-medium mb-1">Kabupaten/Kota</label>
    <select v-model="selectedRegency"
      @change="onRegencyChange"
      class="w-full p-2 border rounded">
      <option value="">-- Pilih Kabupaten/Kota --</option>
      <option v-for="r in regencies" :key="r.id" :value="r.id">
        {{ r.name }}
      </option>
    </select>
  </div>

  <!-- Kecamatan -->
  <div class="mb-3">
    <label class="block text-sm font-medium mb-1">Kecamatan</label>
    <select v-model="selectedDistrict"
      @change="onDistrictChange"
      class="w-full p-2 border rounded">
      <option value="">-- Pilih Kecamatan --</option>
      <option v-for="d in districts" :key="d.id" :value="d.id">
        {{ d.name }}
      </option>
    </select>
  </div>

  <!-- Kelurahan -->
  <div class="mb-3">
    <label class="block text-sm font-medium mb-1">Kelurahan</label>
    <select v-model="selectedVillage"
      @change="onVillageChange"
      class="w-full p-2 border rounded">
      <option value="">-- Pilih Kelurahan --</option>
      <option v-for="v in villages" :key="v.id" :value="v.id">
        {{ v.name }}
      </option>
    </select>
  </div>

</div>

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

      <div class="text-right">
        <button
          type="button"
          @click="savePost"
          class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
        >
          {{ isEdit ? 'Update' : 'Publish' }}
        </button>
      </div>
      
    </div>

    <MediaPickerModal
      :show="showMediaPicker"
      @close="showMediaPicker = false"
      @select="selectImage"
    />
  </div>
</template>

<script>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'
import MediaPickerModal from '@/views/MediaPicker.vue'

export default {
  components: { QuillEditor, MediaPickerModal },
  data() {
    return {
      form: {
        id: null,
        title: '',
        slug: '',
        excerpt: '',
        type_id: null,
        content: '',
        status: 'draft',
        thumbnail_url: '',
        other_images: [],
        website_id: 1,
        user_id: 1,
      },
      listingTypes: [],
      selectedListingType: null,
      listingForm: {
        price: '',
        kondisi: '',
        latitude: '',
        longitude: '',
        provinsi: '',
        kabupaten: '',
        kecamatan: '',
        kelurahan: '',
        additional: {}
      },
        provinces: [],
        regencies: [],
        districts: [],
        villages: [],

        selectedProvince: '',
        selectedRegency: '',
        selectedDistrict: '',
        selectedVillage: '',

      seo: { meta_title: '', meta_description: '' },
      isEdit: false,
      showMediaPicker: false,
      pickerTarget: 'thumbnail'
    }
  },
  methods: {
  generateSlug() {
    if (this.form.title) {
      this.form.slug = this.form.title.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
    }
  },

  getImageUrl(path) {
    return path?.startsWith('http') ? path : API_ENDPOINTS.media(path)
  },

  selectImage(url) {
    if (this.pickerTarget === 'thumbnail') this.form.thumbnail_url = url
    else if (this.pickerTarget === 'other_images' && !this.form.other_images.includes(url))
      this.form.other_images.push(url)
    this.showMediaPicker = false
    this.pickerTarget = 'thumbnail'
  },

  removeOtherImage(index) {
    this.form.other_images.splice(index, 1)
  },

  selectListingType(typeId) {
    this.form.type_id = typeId

    const type = this.listingTypes.find(t => t.id === typeId)
    if (type && type.parameter) {
      const params = JSON.parse(type.parameter)
      this.listingForm.additional = {}
      Object.keys(params).forEach(key => {
        this.listingForm.additional[key] = params[key] || ''
      })
    }
  },

  async fetchListingTypes() {
    try {
      const res = await axios.get(API_ENDPOINTS.listingType.list)
      this.listingTypes = res.data.data
    } catch (err) {
      console.error('Gagal fetch listing types:', err)
    }
  },

  // 🔥 — Semuanya sekarang ADA DI DALAM methods
  async fetchProvinces() {
    try {
      const res = await axios.get(API_ENDPOINTS.provinces)
      this.provinces = res.data || []
    } catch (err) {
      console.error("Failed fetch provinces:", err)
    }
  },

  async fetchRegencies(provinceId) {
    if (!provinceId) return []
    try {
      const res = await axios.get(API_ENDPOINTS.regencies, {
        params: { province_id: provinceId }
      })
      return res.data || []
    } catch (err) {
      console.error("Failed fetch regencies:", err)
      return []
    }
  },

  async fetchDistricts(regencyId) {
    if (!regencyId) return []
    try {
      const res = await axios.get(API_ENDPOINTS.districts, {
        params: { regency_id: regencyId }
      })
      return res.data || []
    } catch (err) {
      console.error("Failed fetch districts:", err)
      return []
    }
  },

  async fetchVillages(districtId) {
    if (!districtId) return []
    try {
      const res = await axios.get(API_ENDPOINTS.villages, {
        params: { district_id: districtId }
      })
      return res.data || []
    } catch (err) {
      console.error("Failed fetch villages:", err)
      return []
    }
  },

  async onProvinceChange() {
    this.listingForm.provinsi = this.provinces.find(p => p.id == this.selectedProvince)?.name || ''

    this.regencies = await this.fetchRegencies(this.selectedProvince)
    this.selectedRegency = ''
    this.districts = []
    this.villages = []

    this.listingForm.kabupaten = ''
    this.listingForm.kecamatan = ''
    this.listingForm.kelurahan = ''
  },

  async onRegencyChange() {
    this.listingForm.kabupaten = this.regencies.find(r => r.id == this.selectedRegency)?.name || ''

    this.districts = await this.fetchDistricts(this.selectedRegency)
    this.selectedDistrict = ''
    this.villages = []

    this.listingForm.kecamatan = ''
    this.listingForm.kelurahan = ''
  },

  async onDistrictChange() {
    this.listingForm.kecamatan = this.districts.find(d => d.id == this.selectedDistrict)?.name || ''

    this.villages = await this.fetchVillages(this.selectedDistrict)
    this.selectedVillage = ''

    this.listingForm.kelurahan = ''
  },

  async onVillageChange() {
    this.listingForm.kelurahan = this.villages.find(v => v.id == this.selectedVillage)?.name || ''
  },
    async savePost() {
      try {
        const postPayload = {
          ...this.form,
          meta: [
            { meta_key: 'meta_title', meta_value: this.seo.meta_title },
            { meta_key: 'meta_description', meta_value: this.seo.meta_description }
          ]
        };

        let postRes;
        if (this.isEdit && this.form.id) {
          postRes = await axios.put(`${API_ENDPOINTS.posts}/${this.form.id}`, postPayload);
        } else {
          postRes = await axios.post(API_ENDPOINTS.posts, postPayload);
        }

        const postId = postRes.data.data.id;

        // Simpan listing
        if (this.selectedListingType || Object.keys(this.listingForm.additional).length) {
        const listingPayload = {
        listing_type: this.selectedListingType,
        price: this.listingForm.price || null,
        kondisi: this.listingForm.kondisi || null,
        latitude: this.listingForm.latitude || null,
        longitude: this.listingForm.longitude || null,
        provinsi: this.listingForm.provinsi || null,
        kabupaten: this.listingForm.kabupaten || null,
        kecamatan: this.listingForm.kecamatan || null,
        kelurahan: this.listingForm.kelurahan || null,
        listing_values: Object.keys(this.listingForm.additional).map(key => ({
            tag_name: key,
            value: this.listingForm.additional[key] || ''
        }))
        };

  if (this.isEdit) {
    await axios.put(API_ENDPOINTS.listing.update(postId), listingPayload);
  } else {
    await axios.post(API_ENDPOINTS.listing.create, { post_id: postId, ...listingPayload });
  }
}

        this.$router.push('/admin/listing');
      } catch (err) {
        console.error('Gagal save post/listing:', err.response?.data || err);
        alert('Gagal menyimpan post/listing. Cek console untuk detail.');
      }
    }
  },
async fetchProvinces() {
  try {
    const res = await axios.get(API_ENDPOINTS.provinces);
    this.provinces = res.data.data || [];
  } catch (err) {
    console.error("Failed fetch provinces:", err);
  }
},

async fetchRegencies(provinceId) {
  if (!provinceId) return [];
  try {
    const res = await axios.get(API_ENDPOINTS.regencies, {
      params: { province_id: provinceId }
    });
    return res.data.data || [];
  } catch (err) {
    console.error("Failed fetch regencies:", err);
    return [];
  }
},

async fetchDistricts(regencyId) {
  if (!regencyId) return [];
  try {
    const res = await axios.get(API_ENDPOINTS.districts, {
      params: { regency_id: regencyId }
    });
    return res.data.data || [];
  } catch (err) {
    console.error("Failed fetch districts:", err);
    return [];
  }
},

async fetchVillages(districtId) {
  if (!districtId) return [];
  try {
    const res = await axios.get(API_ENDPOINTS.villages, {
      params: { district_id: districtId }
    });
    return res.data.data || [];
  } catch (err) {
    console.error("Failed fetch villages:", err);
    return [];
  }
},
  async mounted() {
    await this.fetchListingTypes()
    await this.fetchProvinces();

    // Jika edit
    const postId = this.$route.params.postId
    if (postId) {
  this.isEdit = true;
  try {
    const res = await axios.get(`${API_ENDPOINTS.listing.detail(postId)}`);
    const listing = res.data.data;

    // Prefill form
    this.form = {
      ...this.form,
      title: listing.post?.title || '',
      slug: listing.post?.slug || '',
      excerpt: listing.post?.excerpt || '',
      status: listing.post?.status || 'draft',
      thumbnail_url: listing.post?.thumbnail_url || '',
      other_images: listing.post?.other_images || [],
      type_id: listing.listing_type || null,
    };

    this.seo = {
      meta_title: listing.post?.meta?.find(m => m.meta_key === 'meta_title')?.meta_value || '',
      meta_description: listing.post?.meta?.find(m => m.meta_key === 'meta_description')?.meta_value || ''
    };

    this.selectedListingType = listing.listing_type;
    this.listingForm = {
      ...this.listingForm,
      price: listing.price || '',
      kondisi: listing.kondisi || '',
      latitude: listing.latitude || '',
      longitude: listing.longitude || '',
      provinsi: listing.provinsi || '',
      kabupaten: listing.kabupaten || '',
      kecamatan: listing.kecamatan || '',
      kelurahan: listing.kelurahan || '',
      additional: {}
    };

    listing.values?.forEach(v => {
      this.listingForm.additional[v.tag_name] = v.value;
    });
// Auto-load dropdown values jika edit
if (this.listingForm.provinsi) {
  const prov = this.provinces.find(p => p.name === this.listingForm.provinsi)
  if (prov) {
    this.selectedProvince = prov.id
    this.regencies = await this.fetchRegencies(prov.id)

    const reg = this.regencies.find(r => r.name === this.listingForm.kabupaten)
    if (reg) {
      this.selectedRegency = reg.id
      this.districts = await this.fetchDistricts(reg.id)

      const dist = this.districts.find(d => d.name === this.listingForm.kecamatan)
      if (dist) {
        this.selectedDistrict = dist.id
        this.villages = await this.fetchVillages(dist.id)

        const vil = this.villages.find(v => v.name === this.listingForm.kelurahan)
        if (vil) {
          this.selectedVillage = vil.id
        }
      }
    }
  }
}

  } catch (err) {
    console.error('Gagal fetch listing untuk edit:', err.response?.data || err);
  }
}

    // Jika ada listingTypeId di route
    const typeId = this.$route.params.listingTypeId
    if (typeId && !this.isEdit) {
      this.selectedListingType = parseInt(typeId)
      this.selectListingType(this.selectedListingType)
    }
  }
}
</script>
