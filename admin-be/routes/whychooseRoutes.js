const express = require('express')
const router = express.Router()
const { WhyChooseUs } = require('../models')

// GET all data
router.get('/', async (req, res) => {
  const header = await WhyChooseUs.findOne({ where: { type: 'header' } })
  const benefits = await WhyChooseUs.findAll({ where: { type: 'benefit' } })
  res.json({ header, benefits })
})

// PUT update header
router.put('/header', async (req, res) => {
  const { title, subtitle } = req.body
  let header = await WhyChooseUs.findOne({ where: { type: 'header' } })
  if (header) {
    header.title = title
    header.subtitle = subtitle
    await header.save()
  } else {
    header = await WhyChooseUs.create({ title, subtitle, type: 'header' })
  }
  res.json(header)
})

// POST create benefit
router.post('/benefit', async (req, res) => {
  const { title, desc, icon } = req.body
  const benefit = await WhyChooseUs.create({ title, desc, icon, type: 'benefit' })
  res.json(benefit)
})

// PUT update benefit
router.put('/benefit/:id', async (req, res) => {
  const { title, desc, icon } = req.body
  const benefit = await WhyChooseUs.findByPk(req.params.id)
  if (benefit) {
    benefit.title = title
    benefit.desc = desc
    benefit.icon = icon
    await benefit.save()
    res.json(benefit)
  } else {
    res.status(404).json({ message: 'Benefit not found' })
  }
})

// DELETE benefit
router.delete('/benefit/:id', async (req, res) => {
  const benefit = await WhyChooseUs.findByPk(req.params.id)
  if (benefit) {
    await benefit.destroy()
    res.json({ message: 'Benefit deleted' })
  } else {
    res.status(404).json({ message: 'Benefit not found' })
  }
})

module.exports = router
