const { ProcessSection } = require('../models')

exports.getProcessSection = async (req, res) => {
  try {
    const data = await ProcessSection.findOne({ where: { id: 1 } })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data', error: err.message })
  }
}

exports.updateProcessSection = async (req, res) => {
    try {
        console.log('Received body:', req.body)
      const [data, created] = await ProcessSection.findOrCreate({
        where: { id: 1 },
        defaults: req.body
      })
  
      if (!created) {
        await data.update(req.body)
      }
  
      res.json({ message: 'Data berhasil disimpan', data })
    } catch (err) {
        console.error('UPDATE ERROR:', err)
      console.error('UPDATE ERROR:', err) // 👈 log ini penting
      res.status(500).json({ message: 'Gagal menyimpan data', error: err.message })
    }
  }
  