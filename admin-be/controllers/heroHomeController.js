// controller/heroHomeController.js
const { HeroHome } = require('../models')

exports.getHeroHome = async (req, res) => {
  try {
    let hero = await HeroHome.findOne({ where: { id: 1 } })
    if (!hero) {
      hero = await HeroHome.create({ id: 1, type: 'static' })
    }
    res.json(hero)
  } catch (error) {
    console.error('GET HeroHome error:', error)
    res.status(500).json({ message: 'Gagal mengambil data hero', error: error.message })
  }
}

exports.updateHeroHome = async (req, res) => {
  try {
    const {
      type,
      title,
      subtitle,
      highlight,
      description,
      imageUrl,
      ctaText,
      ctaLink,
      slides
    } = req.body

    if (!type || !['static', 'slider'].includes(type)) {
      return res.status(400).json({ message: 'Tipe hero harus "static" atau "slider"' })
    }

    let updateData = { type }

    if (type === 'static') {
      Object.assign(updateData, {
        title: title || '',
        subtitle: subtitle || '',
        highlight: highlight || '',
        description: description || '',
        imageUrl: imageUrl || '',
        ctaText: ctaText || '',
        ctaLink: ctaLink || '',
        slides: [] // kosongkan slide
      })
    } else if (type === 'slider') {
      if (!Array.isArray(slides)) {
        return res.status(400).json({ message: 'Slides harus berupa array' })
      }
      Object.assign(updateData, {
        slides,
        title: null,
        subtitle: null,
        highlight: null,
        description: null,
        imageUrl: null,
        ctaText: null,
        ctaLink: null
      })
    }

    let hero = await HeroHome.findOne({ where: { id: 1 } })
    if (!hero) {
      hero = await HeroHome.create({ id: 1 })
    }

    await hero.update(updateData)

    res.json({ message: 'Berhasil diperbarui', data: hero })
  } catch (error) {
    console.error('UPDATE HeroHome error:', error)
    res.status(500).json({ message: 'Gagal memperbarui data hero', error: error.message })
  }
}
