"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("listing_types", [
      {
        name: "Properti",
        parameter: JSON.stringify({
          luas_bangunan: "",
          luas_tanah: "",
          jumlah_kamar: "",
          jumlah_kamar_mandi: "",
          sertifikat: "",
          listrik: "",
          air: "",
          fasilitas: []
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Mobil",
        parameter: JSON.stringify({
          merk: "",
          model: "",
          tahun: "",
          transmisi: "",
          kilometer: "",
          bahan_bakar: "",
          warna: "",
          fitur: []
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Motor",
        parameter: JSON.stringify({
          merk: "",
          model: "",
          tahun: "",
          kilometer: "",
          warna: "",
          kondisi: "",
          fitur: []
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Handphone",
        parameter: JSON.stringify({
          merk: "",
          model: "",
          ram: "",
          storage: "",
          kondisi: "",
          warna: ""
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Laptop",
        parameter: JSON.stringify({
          merk: "",
          model: "",
          processor: "",
          ram: "",
          storage: "",
          vga: "",
          kondisi: ""
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("listing_types", null, {});
  }
};
