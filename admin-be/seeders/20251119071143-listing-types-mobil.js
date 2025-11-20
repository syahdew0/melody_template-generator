"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("listing_types", [
   
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

    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("listing_types", null, {});
  }
};
