"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("listing_types", [
      
      // PROPERTI
      
      {
        name: "Properti",
        parameter: JSON.stringify([
          { tagname: "luas_bangunan", label: "Luas Bangunan (m²)", type: "number", options: null },
          { tagname: "luas_tanah", label: "Luas Tanah (m²)", type: "number", options: null },
          { tagname: "jumlah_kamar", label: "Jumlah Kamar", type: "number", options: null },
          { tagname: "jumlah_kamar_mandi", label: "Jumlah Kamar Mandi", type: "number", options: null },
          { tagname: "sertifikat", label: "Tipe Sertifikat", type: "string", options: ["SHM", "HGB", "Strata Title"] },
          { tagname: "listrik", label: "Daya Listrik", type: "string", options: ["900W", "1300W", "2200W", "3500W", "5500W"] },
          { tagname: "air", label: "Sumber Air", type: "string", options: ["PDAM", "Sumur Bor"] },
          { tagname: "fasilitas", label: "Fasilitas", type: "string", options: null }
        ]),
        created_at: new Date(),
        updated_at: new Date()
      },

      
      // MOBIL
      
      {
        name: "Mobil",
        parameter: JSON.stringify([
          { tagname: "merk", label: "Merk", type: "string", options: ["Toyota", "Honda", "Suzuki", "Daihatsu", "Mitsubishi", "Hyundai", "Kia"] },
          { tagname: "model", label: "Model", type: "string", options: null },
          { tagname: "tahun", label: "Tahun", type: "number", options: null },
          { tagname: "transmisi", label: "Transmisi", type: "string", options: ["Manual", "Automatic"] },
          { tagname: "kilometer", label: "Kilometer", type: "number", options: null },
          { tagname: "bahan_bakar", label: "Bahan Bakar", type: "string", options: ["Bensin", "Diesel", "Hybrid", "Listrik"] },
          { tagname: "warna", label: "Warna", type: "string", options: null },
          { tagname: "fitur", label: "Fitur Tambahan", type: "string", options: null }
        ]),
        created_at: new Date(),
        updated_at: new Date()
      },

      
      // MOTOR
      
      {
        name: "Motor",
        parameter: JSON.stringify([
          { tagname: "merk", label: "Merk", type: "string", options: ["Honda", "Yamaha", "Suzuki", "Kawasaki"] },
          { tagname: "model", label: "Model", type: "string", options: null },
          { tagname: "tahun", label: "Tahun", type: "number", options: null },
          { tagname: "kilometer", label: "Kilometer", type: "number", options: null },
          { tagname: "warna", label: "Warna", type: "string", options: null },
          // { tagname: "kondisi", label: "Kondisi", type: "string", options: ["Baru", "Bekas"] },
          { tagname: "fitur", label: "Fitur Tambahan", type: "string", options: null }
        ]),
        created_at: new Date(),
        updated_at: new Date()
      },

      
      // HANDPHONE
      
      {
        name: "Handphone",
        parameter: JSON.stringify([
          { tagname: "merk", label: "Merk", type: "string", options: ["Apple", "Samsung", "Xiaomi", "Oppo", "Vivo", "Realme"] },
          { tagname: "model", label: "Model", type: "string", options: null },
          { tagname: "ram", label: "RAM", type: "string", options: ["2GB", "3GB", "4GB", "6GB", "8GB", "12GB"] },
          { tagname: "storage", label: "Storage", type: "string", options: ["32GB", "64GB", "128GB", "256GB", "512GB"] },
          // { tagname: "kondisi", label: "Kondisi", type: "string", options: ["Baru", "Bekas"] },
          { tagname: "warna", label: "Warna", type: "string", options: ["Hitam", "Putih", "Biru", "Gold", "Silver"] }
        ]),
        created_at: new Date(),
        updated_at: new Date()
      },

      
      // LAPTOP
      {
        name: "Laptop",
        parameter: JSON.stringify([
          { tagname: "merk", label: "Merk", type: "string", options: ["Asus", "Acer", "HP", "Dell", "Lenovo", "MacBook"] },
          { tagname: "model", label: "Model", type: "string", options: null },
          { tagname: "processor", label: "Processor", type: "string", options: ["Intel i3", "Intel i5", "Intel i7", "Ryzen 3", "Ryzen 5", "Ryzen 7"] },
          { tagname: "ram", label: "RAM", type: "string", options: ["4GB", "8GB", "16GB", "32GB"] },
          { tagname: "storage", label: "Storage", type: "string", options: ["SSD 128GB", "SSD 256GB", "SSD 512GB", "SSD 1TB"] },
          { tagname: "vga", label: "VGA", type: "string", options: ["Integrated", "NVIDIA", "AMD Radeon"] },
          // { tagname: "kondisi", label: "Kondisi", type: "string", options: ["Baru", "Bekas"] }
        ]),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("listing_types", null, {});
  }
};
