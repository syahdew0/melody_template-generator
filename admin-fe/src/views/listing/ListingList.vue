<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Listing List</h1>

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
          <tr v-for="listing in listings" :key="listing.post_id" class="border-t">
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
          <tr v-if="listings.length === 0">
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
    }
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
}
  ,
  mounted() {
    this.fetchListings()
  }
}
</script>

<style scoped>
table th, table td {
  vertical-align: middle;
}
</style>
