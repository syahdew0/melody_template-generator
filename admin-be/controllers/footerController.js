const { FooterSetting } = require('../models')

// GET footer for admin
exports.getFooterAdmin = async (req, res) => {
  try {
    let data = await FooterSetting.findOne({ where: { id: 1 } })
    if (!data) {
      data = await FooterSetting.create({
        id: 1,
        brand: 'Nama Brand',
        description: 'Deskripsi Footer...',
        logo: '',
        navigation: [],
        contact: { address: '', phone: '', email: '' },
        socials: [],
        layoutOptions: {
          showNavigation: true,
          showContact: true,
          showSocials: true,
          style: 'dark'
        }
      })
    }
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// UPDATE footer from admin panel
exports.updateFooter = async (req, res) => {
    try {
      const body = { ...req.body }
  
      // Parse JSON string (jika datang sebagai string dari frontend)
      const keys = ['navigation', 'contact', 'socials', 'layoutOptions']
      keys.forEach(key => {
        if (typeof body[key] === 'string') {
          body[key] = JSON.parse(body[key])
        }
      })
  
      const [updated] = await FooterSetting.update(body, { where: { id: 1 } })
  
      if (!updated) {
        return res.status(404).json({ message: 'Footer tidak ditemukan' })
      }
  
      res.json({ message: 'Footer berhasil diperbarui' })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: err.message })
    }
  }
  

// GET for frontend public (tanpa data sensitif kalau perlu)
exports.getFooterPublic = async (req, res) => {
    try {
      let data = await FooterSetting.findOne({ where: { id: 1 } })
  
      // Tambahkan fallback jika tidak ditemukan
      if (!data) {
        data = await FooterSetting.create({
          id: 1,
          logo: '',
          brand: 'Nama Brand',
          description: 'Deskripsi footer...',
          navigation: [],
          contact: { address: '', phone: '', email: '' },
          socials: [],
          layoutOptions: {
            showNavigation: true,
            showContact: true,
            showSocials: true,
            style: 'dark'
          }
        })
      }
  
      // Pastikan data dalam format object, bukan string JSON
      const parsed = {
        ...data.toJSON(),
        navigation: typeof data.navigation === 'string' ? JSON.parse(data.navigation) : data.navigation,
        contact: typeof data.contact === 'string' ? JSON.parse(data.contact) : data.contact,
        socials: typeof data.socials === 'string' ? JSON.parse(data.socials) : data.socials,
        layoutOptions: typeof data.layoutOptions === 'string' ? JSON.parse(data.layoutOptions) : data.layoutOptions,
      }
  
      res.json(parsed)
    } catch (err) {
      console.error('Error getFooterPublic:', err)
      res.status(500).json({ error: err.message })
    }
  }
