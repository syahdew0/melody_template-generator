// controllers/rajaOngkirController.js
const axios = require('axios');

const RAJA_ONGKIR_API = 'https://api.rajaongkir.com/basic';
const API_KEY = process.env.RAJA_ONGKIR_API_KEY;

const rajaOngkirController = {
  // Get all provinces
  async getProvinces(req, res) {
    try {
      const response = await axios.get(`${RAJA_ONGKIR_API}/province`, {
        headers: { key: API_KEY },
      });
      const provinces = response.data.rajaongkir.results;
      res.json({ success: true, data: provinces });
    } catch (error) {
      console.error('getProvinces error:', error.message);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.rajaongkir?.status?.description || 'Failed to get provinces',
      });
    }
  },

  // Get cities by province ID
  async getCities(req, res) {
    const { provinceId } = req.query;
    if (!provinceId) {
      return res.status(400).json({ success: false, message: 'provinceId is required' });
    }

    try {
      const response = await axios.get(`${RAJA_ONGKIR_API}/city`, {
        headers: { key: API_KEY },
        params: { province: provinceId },
      });
      const cities = response.data.rajaongkir.results;
      res.json({ success: true, data: cities });
    } catch (error) {
      console.error('getCities error:', error.message);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.rajaongkir?.status?.description || 'Failed to get cities',
      });
    }
  },

  // Get shipping cost
  async getCost(req, res) {
    const { origin, destination, weight, courier } = req.body;
    if (!origin || !destination || !weight || !courier) {
      return res.status(400).json({ success: false, message: 'origin, destination, weight, and courier are required' });
    }

    try {
      const response = await axios.post(
        `${RAJA_ONGKIR_API}/cost`,
        { origin, destination, weight, courier },
        { headers: { key: API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      const costs = response.data.rajaongkir.results;
      res.json({ success: true, data: costs });
    } catch (error) {
      console.error('getCost error:', error.message);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.rajaongkir?.status?.description || 'Failed to get cost',
      });
    }
  },
};

module.exports = rajaOngkirController;
