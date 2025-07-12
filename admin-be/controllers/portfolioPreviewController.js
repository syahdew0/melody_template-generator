const { PortfolioPreview } = require('../models')

// module.exports = {
//   async getPreview(req, res) {
//     try {
//       let preview = await PortfolioPreview.findOne()
//       if (!preview) {
//         preview = await PortfolioPreview.create({
//           hero: { title: '', description: '' },
//           cta: { cta1Label: '', cta1Path: '', cta2Label: '', cta2Link: '', description: '' },
//           projects: [],
//         })
//       }
//       res.json(preview) 
//     } catch (err) {
//       console.error(err)
//       res.status(500).json({ message: 'Server error fetching preview.' })
//     }
//   },

//   async updatePreview(req, res) {
//     try {
//       const { hero, cta, projects } = req.body
//       const preview = await PortfolioPreview.findOne()
//       if (!preview) return res.status(404).json({ message: 'Preview not found.' })

//       preview.hero = hero
//       preview.cta = cta
//       preview.projects = projects
//       await preview.save()

//       res.json(preview)
//     } catch (err) {
//       console.error(err)
//       console.log('Payload received:', req.body)
//       res.status(500).json({ message: 'Server error updating preview.' })
//     }
//   },
// }


function parseJSONFields(obj, fields) {
  const result = { ...obj }
  fields.forEach((key) => {
    try {
      result[key] = JSON.parse(obj[key])
    } catch {
      result[key] = null
    }
  })
  return result
}

module.exports = {
  async getPreview(req, res) {
    try {
      let preview = await PortfolioPreview.findOne()

      // Jika belum ada, buat default dengan JSON.stringify
      if (!preview) {
        preview = await PortfolioPreview.create({
          hero: JSON.stringify({ title: '', description: '' }),
          cta: JSON.stringify({
            cta1Label: '',
            cta1Path: '',
            cta2Label: '',
            cta2Link: '',
            description: '',
          }),
          projects: JSON.stringify([]),
        })
      }

      // Convert Sequelize instance ke plain object
      const plain = preview.get({ plain: true })

      // Parse TEXT jadi object JS
      const parsed = parseJSONFields(plain, ['hero', 'cta', 'projects'])

      res.json(parsed)
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Server error fetching preview.' })
    }
  },

  async updatePreview(req, res) {
    try {
      const { hero, cta, projects } = req.body

      const preview = await PortfolioPreview.findOne()
      if (!preview) return res.status(404).json({ message: 'Preview not found.' })

      // Simpan dengan JSON.stringify karena kolom TEXT
      preview.hero = JSON.stringify(hero)
      preview.cta = JSON.stringify(cta)
      preview.projects = JSON.stringify(projects)

      await preview.save()

      // Kembalikan versi parsed agar frontend langsung bisa pakai
      const plain = preview.get({ plain: true })
      const parsed = parseJSONFields(plain, ['hero', 'cta', 'projects'])

      res.json(parsed)
    } catch (err) {
      console.error(err)
      console.log('Payload received:', req.body)
      res.status(500).json({ message: 'Server error updating preview.' })
    }
  },
}
