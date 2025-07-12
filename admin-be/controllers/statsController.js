const fs = require('fs')
const path = require('path')
const filePath = path.join(__dirname, '../data/stats.json')

exports.getData = (req, res) => {
  if (!fs.existsSync(filePath)) return res.json({ stats: [] })
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  res.json(data)
}

exports.saveData = (req, res) => {
  const data = { stats: req.body.stats }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  res.json({ message: 'Saved successfully' })
}
