<template>
  <div class="p-6">
    <!-- Header + tombol Add -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-2xl font-bold">
          <span v-if="currentTypeName">Listing: {{ currentTypeName }}</span>
          <span v-else>Listing List</span>
        </h1>
        <p v-if="currentTypeName" class="text-sm text-gray-500">
          Menampilkan listing untuk tipe: {{ currentTypeName }}
        </p>
      </div>

      <button
        type="button"
        @click="goToAdd"
        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold text-sm"
      >
        + Add Listing
      </button>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto bg-white border rounded shadow-sm">
      <table class="w-full text-left table-auto">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2">ID</th>
            <th class="px-4 py-2">Title</th>
            <th class="px-4 py-2">Listing Type</th>
            <th class="px-4 py-2">Price</th>
            <th class="px-4 py-2">Status</th>
            <th class="px-4 py-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="listing in filteredListings"
            :key="listing.post_id"
            class="border-t"
          >
            <td class="px-4 py-2">{{ listing.post_id }}</td>
            <td class="px-4 py-2">{{ listing.post?.title || '-' }}</td>
            <td class="px-4 py-2">{{ listing.listingType?.name || '-' }}</td>
            <td class="px-4 py-2">{{ formatPrice(listing.price) }}</td>
            <td class="px-4 py-2">{{ listing.post?.status || '-' }}</td>
            <td class="px-4 py-2 space-x-2">
              <button 
                @click="listing.post_id && editListing(listing.post_id, listing.listing_type)" 
                class="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button 
                @click="listing.post_id && deleteListing(listing.post_id)" 
                class="text-red-600 hover:underline"
              >
                Delete
              </button>
            </td>
          </tr>

          <tr v-if="filteredListings.length === 0">
            <td colspan="6" class="px-4 py-4 text-center text-gray-500">
              No listings found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

export default {
  data() {
    return {
      listings: [],
      selectedTypeId: null,   
    }
  },

  computed: {
    // baca type dari route query
    currentTypeId() {
      const t = this.$route.query.type
      return t ? Number(t) : null
    },

    // ambil nama tipe dari data listing (pakai listingType)
    currentTypeName() {
      if (!this.currentTypeId) return null
      const found = this.listings.find(
        l => Number(l.listing_type) === this.currentTypeId
      )
      return found?.listingType?.name || null
    },

    // list yang sudah difilter per type (kalau ada)
    filteredListings() {
      if (!this.currentTypeId) return this.listings
      return this.listings.filter(
        l => Number(l.listing_type) === this.currentTypeId
      )
    }
  },
goToAdd() {
  if (!this.currentTypeId) {
    alert('Silakan pilih Listing Type dari sidebar untuk menambah listing.')
    return
  }

  this.$router.push({
    name: 'ListingForm',
    params: { listingTypeId: this.currentTypeId }
  })
},
  methods: {
    async fetchListings() {
      try {
        const res = await axios.get(API_ENDPOINTS.listing.list)
        this.listings = res.data.data
      } catch (err) {
        console.error('Gagal fetch listings:', err.response?.data || err)
      }
    },

    formatPrice(value) {
      if (!value) return '-'
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)
    },

    // tombol Add - pakai type dari query
    goToAdd() {
      if (!this.currentTypeId) {
        alert('Silakan pilih Listing Type dari sidebar untuk menambah listing.')
        return
      }

      this.$router.push({
        name: 'ListingForm',
        params: { listingTypeId: this.currentTypeId }
      })
    },

    editListing(postId, listingTypeId) {
      if (!listingTypeId) {
        const listing = this.listings.find(l => l.post_id === postId);
        listingTypeId = listing?.listing_type;
      }
      if (!postId || !listingTypeId) return alert('Cannot edit listing: missing ID or type');
      this.$router.push({ name: 'ListingForm', params: { listingTypeId, postId } });
    },

    async deleteListing(postId) {
      if (!postId) return alert('Invalid listing ID');
      if (!confirm('Are you sure?')) return;

      try {
        await axios.delete(API_ENDPOINTS.listing.delete(postId));
        this.listings = this.listings.filter(l => l.post_id !== postId);
      } catch (err) {
        console.error('Gagal delete listing:', err.response?.data || err);
      }
    }
  },

  mounted() {
    this.fetchListings()
  },

  watch: {
    '$route.query.type'() {
     
    }
  }
}
</script>
