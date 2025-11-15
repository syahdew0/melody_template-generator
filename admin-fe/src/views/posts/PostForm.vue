<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
    <!-- Konten Utama -->
    <div class="lg:col-span-2 space-y-4">
      <div>
        <label class="block font-semibold text-gray-700 mb-1">Title</label>
        <input v-model="form.title" @input="generateSlug"
          placeholder="Add Title"
          class="w-full text-4xl font-bold border border-gray-300 focus:ring-0 placeholder-gray-400"
        />
      </div>

      <div>
        <label class="block font-semibold text-gray-700 mb-1">Excerpt</label>
        <textarea
          v-model="form.excerpt"
          placeholder="Write an excerpt..."
          class="w-full text-sm text-gray-600 border border-dashed rounded p-3"
          rows="2"
        ></textarea>
      </div>

      <div class="bg-white border rounded shadow-sm p-4 space-y-2 min-h-[300px]">
        <label class="block font-semibold text-gray-700 mb-1">Content</label>
        <quill-editor
          v-model:content="form.content"
          contentType="html"
          class="min-h-[300px] bg-white border rounded"
        />
      </div>
      <!-- Additional Kolom (Fixed 5 Fields) -->
<div class="bg-white border rounded shadow-sm p-4">
  <h3 class="font-semibold mb-2">Additional Fields</h3>

  <div v-for="n in 5" :key="n" class="mb-3">
    <label class="block text-sm font-medium mb-1">
      Additional Kolom {{ n }}
    </label>
    <input
      v-model="form.additional[n - 1]"
      :placeholder="'Isi Additional Kolom ' + n"
      class="w-full p-2 border rounded"
    />
  </div>
</div>

    </div>

    <!-- Sidebar -->
    <div class="space-y-4">
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
      <!-- Other Images -->
      <div class="bg-white border rounded shadow-sm p-4">
        <h3 class="font-semibold mb-2">Other Images</h3>
        <button
          class="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
          @click="showMediaPicker = true; pickerTarget = 'other_images'"
        >
          Add Images
        </button>

        <div v-if="form.other_images.length" class="mt-3 grid grid-cols-3 gap-2">
          <div
            v-for="(img, index) in form.other_images"
            :key="index"
            class="relative group"
          >
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

      <div class="bg-white border rounded shadow-sm p-4">
        <h3 class="font-semibold mb-2">Categories</h3>
        <div class="space-y-2 max-h-40 overflow-y-auto">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="flex items-center gap-2"
          >
            <input
              type="checkbox"
              :value="cat.id"
              v-model="form.category_ids"
            />
            <label class="text-sm">{{ cat.name }}</label>
          </div>
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
  </div>
</template>

<script>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'
import MediaPickerModal from '@/views/MediaPicker.vue'

export default {
  components: {
    MediaPickerModal,
    QuillEditor
  },
  data() {
    return {
      form: {
        id: null, 
        title: '',
        slug: '',
        excerpt: '',
         type: 'post',      
          type_id: 1,  
        content: '',
        status: 'draft',
        thumbnail_url: '',
        other_images:[],
        website_id: 1,
        user_id: 1,
        category_ids: [],
        additional: [''],
      },
      seo: {
        meta_title: '',
        meta_description: ''
      },
      categories: [],
      isEdit: false,
      showMediaPicker: false,
      pickerTarget: 'thumbnail'
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
  return path.startsWith('http') ? path : API_ENDPOINTS.media(path)
},
    // selectImage(url) {
    //   this.form.thumbnail_url = url
    //   this.showMediaPicker = false
    // },
selectImage(url) {
  if (this.pickerTarget === 'thumbnail') {
    this.form.thumbnail_url = url
  } else if (this.pickerTarget === 'other_images') {
    if (!this.form.other_images.includes(url)) {
      this.form.other_images.push(url)
    }
  }
  this.showMediaPicker = false
  this.pickerTarget = 'thumbnail' // reset ke default
},

  removeOtherImage(index) {
    this.form.other_images.splice(index, 1)
  },

  addAdditionalField() {
  if (this.form.additional.length < 5) {
    this.form.additional.push('')
  }
},
async fetchPost() {
  try {
    const slug = this.$route.params.slug;
    const res = await axios.get(API_ENDPOINTS.postBySlug(slug));
    const post = res.data;

    this.form = {
      ...post,
      category_ids: post.post_categories?.map(c => c.category.id) || [], 
      other_images: Array.isArray(post.other_images) ? post.other_images : [],
    };
    this.form.additional = [
    post.additional_kolom1,
    post.additional_kolom2,
    post.additional_kolom3,
    post.additional_kolom4,
    post.additional_kolom5
  ].filter(v => v && v.trim() !== '');

    // Ambil meta dari post.meta
    if (post.meta?.length > 0) {
      post.meta.forEach(m => {
        if (m.meta_key === 'meta_title') this.seo.meta_title = m.meta_value;
        if (m.meta_key === 'meta_description') this.seo.meta_description = m.meta_value;
      });
    }

    this.isEdit = true;
  } catch (error) {
    console.error('Gagal mengambil data post:', error);
  }
},

async fetchCategories() {
  try {
    const res = await axios.get(API_ENDPOINTS.categories)
    // Hanya ambil kategori pertama atau kategori tertentu, misal display_in = 1
    const filtered = res.data.filter(cat => cat.display_in === 1) // sesuaikan display_in
    this.categories = filtered

    // Kalau create post baru, set default ke kategori pertama
    if (!this.isEdit && this.categories.length > 0) {
      this.form.category_ids = [this.categories[0].id]
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}
,
async savePost() {
  const meta = [
    { meta_key: 'meta_title', meta_value: this.seo.meta_title },
    { meta_key: 'meta_description', meta_value: this.seo.meta_description }
  ];

  const payload = {
    ...this.form,
    other_images: this.form.other_images,
    category_ids: [...this.form.category_ids], 
    type: 'post',
    additional_kolom1: this.form.additional[0] || '',
    additional_kolom2: this.form.additional[1] || '',
    additional_kolom3: this.form.additional[2] || '',
    additional_kolom4: this.form.additional[3] || '',
    additional_kolom5: this.form.additional[4] || '',
    meta
  };

  console.log("Payload final:", payload);

  try {
    if (this.isEdit && this.form.id) {
      await axios.put(`${API_ENDPOINTS.posts}/${this.form.id}`, payload);
    } else {
      await axios.post(API_ENDPOINTS.posts, payload);
    }

    this.$router.push('/admin/posts');
  } catch (error) {
    console.error('Failed to save post:', error.response?.data || error);
  }
},
// async submitForm() {
//   try {
//     if (this.form.id) {
//       await axios.put(`${API_ENDPOINTS.posts}/${this.form.id}`, this.form);
//       this.$toast.success('Berhasil diperbarui');
//     } else {
//       await axios.post(API_ENDPOINTS.posts, this.form);
//       this.$toast.success('Berhasil dibuat');
//     }

//     this.$router.push('/admin/posts');
//   } catch (error) {
//     console.error('Gagal menyimpan data:', error);
//     this.$toast.error('Gagal menyimpan data');
//   }
// },
async deletePost(id) {
  if (confirm('Delete this post?')) {
    try {
      await axios.delete(`${API_ENDPOINTS.posts}/${id}`);
      await this.fetchPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  }
},

  },
 async mounted() {
  await this.fetchCategories()

  if (this.$route.params.slug) {
    await this.fetchPost()
  }
},
}
</script>
