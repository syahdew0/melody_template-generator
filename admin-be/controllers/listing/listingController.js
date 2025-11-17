const { Listing, ListingValue, ListingType, Post, PostMeta } = require('../../models');

module.exports = {

  // GET all listings
async getAll(req, res) {
  try {
    const listings = await Listing.findAll({
      include: [
        { model: Post, as: "post" },
        { model: ListingType, as: "listingType" },
        { model: ListingValue, as: "values" },
      ],
      order: [["post_id", "DESC"]],
    });

    return res.json({ success: true, data: listings });
  } catch (err) {
    console.error("getAll error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
,
  // GET detail listing by post_id
async getDetail(req, res) {
  try {
    const postId = req.params.post_id;

    const listing = await Listing.findOne({
      where: { post_id: postId },
      include: [
        { model: Post, as: "post", include: [{ model: PostMeta, as: "meta" }] },
        { model: ListingType, as: "listingType" },
        { model: ListingValue, as: "values" },
      ],
    });

    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    // Parse other_images agar frontend tidak blank
    const json = listing.toJSON();
    if (json.post?.other_images && typeof json.post.other_images === "string") {
      try {
        json.post.other_images = JSON.parse(json.post.other_images);
      } catch (e) {
        json.post.other_images = [];
      }
    }

    return res.json({ success: true, data: json });
  } catch (err) {
    console.error("getDetail error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
},
  // CREATE listing + values
  async create(req, res) {
    try {
      const {
  post_id,
  listing_type,
  price,
  kondisi,
  latitude,
  longitude,
  provinsi,
  kabupaten,
  kecamatan,
  kelurahan,
  listing_values = []
} = req.body;

      // create listing
      const listing = await Listing.create({
        post_id,
        listing_type,
        price,
        kondisi,
        latitude,
        longitude,
        provinsi,
        kabupaten,
        kecamatan,
        kelurahan
      });

      // insert listing values
  if (Array.isArray(listing_values) && listing_values.length > 0) {
  const insertData = listing_values.map(v => ({
    post_id,
    tag_name: v.tag_name,
    language_id: v.language_id || 1,
    value: v.value
  }));
  await ListingValue.bulkCreate(insertData);
}

      res.json({ success: true, data: listing });

    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

 // UPDATE listing + values
  async update(req, res) {
    try {
      // const postId = req.params.id;
       const postId = req.params.post_id || req.params.id;
      const {
        listing_type,
        price,
        kondisi,
        latitude,
        longitude,
        provinsi,
        kabupaten,
        kecamatan,
        kelurahan,
        listing_values = []
      } = req.body;

      let listing = await Listing.findOne({ where: { post_id: postId } });

      if (listing) {
        await listing.update({ listing_type, price, kondisi, latitude, longitude, provinsi, kabupaten, kecamatan, kelurahan });
      } else {
        listing = await Listing.create({ post_id: postId, listing_type, price, kondisi, latitude, longitude, provinsi, kabupaten, kecamatan, kelurahan });
      }

      // Hapus listing_values lama
      await ListingValue.destroy({ where: { post_id: postId } });

      // Masukkan listing_values baru
      if (Array.isArray(listing_values) && listing_values.length > 0) {
        const insertData = listing_values.map(v => ({
          post_id: postId,
          tag_name: v.tag_name,
          language_id: v.language_id || 1,
          value: v.value == null ? '' : String(v.value)   // ⬅ aman
        }));
        await ListingValue.bulkCreate(insertData);
      }

      // Ambil listing terbaru beserta semua relasi
      const updatedListing = await Listing.findOne({
        where: { post_id: postId },
        include: [
          { model: ListingType, as: 'listingType' },
          { model: ListingValue, as: 'values' },
          { model: Post, as: 'post', include: ['meta'] }
        ]
      });

      res.json({ success: true, data: updatedListing });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // DELETE listing + values
  async delete(req, res) {
    try {
      const { id } = req.params; // pastikan route: /listing/:id
      if (!id) return res.status(400).json({ success: false, message: 'Invalid ID' });

      await ListingValue.destroy({ where: { post_id: id } });
      await Listing.destroy({ where: { post_id: id } });

      res.json({ success: true, message: 'Listing deleted successfully' });
    } catch (err) {
      console.error('Error deleting listing:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET listing values only
  async getByPost(req, res) {
    try {
      const { id } = req.params;

      const data = await ListingValue.findAll({
        where: { post_id: id }
      });

      res.json({ success: true, data });

    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

};
