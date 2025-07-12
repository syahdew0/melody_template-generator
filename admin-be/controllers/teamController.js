const { TeamSection } = require('../models');

exports.getTeamData = async (req, res) => {
  try {
    const header = await TeamSection.findOne({ where: { type: 'header' } });
    const members = await TeamSection.findAll({ where: { type: 'member' } });
    
    // Transform data untuk frontend display
    const transformedMembers = members.map(member => ({
      id: member.id,
      name: member.title,        
      role: member.subtitle,     
      image: member.image
    }));
    
    res.json({
      header: {
        title: header?.title || '',
        subtitle: header?.subtitle || ''
      },
      members: transformedMembers
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Gagal mengambil data tim.' });
  }
};

exports.getHeader = async (req, res) => {
  try {
    const header = await TeamSection.findOne({ where: { type: 'header' } });
    res.json({
      title: header?.title || '',
      subtitle: header?.subtitle || ''
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Gagal mengambil header.' });
  }
};

exports.getMembers = async (req, res) => {
  try {
    const members = await TeamSection.findAll({ where: { type: 'member' } });
    
    // Transform untuk admin frontend
    const transformedMembers = members.map(member => ({
      id: member.id,
      name: member.title,        // title di DB → name di frontend
      role: member.subtitle,     // subtitle di DB → role di frontend
      image: member.image
    }));
    
    res.json(transformedMembers);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Gagal mengambil members.' });
  }
};

// PUT /api/team/header → Update header
exports.updateHeader = async (req, res) => {
  const { title, subtitle } = req.body;
  try {
    let header = await TeamSection.findOne({ where: { type: 'header' } });
    if (header) {
      await header.update({ title, subtitle });
    } else {
      header = await TeamSection.create({ type: 'header', title, subtitle });
    }
    res.json(header);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Gagal memperbarui header.' });
  }
};

// POST /api/team/members → Add member
exports.addMember = async (req, res) => {
  const { name, role, image } = req.body;  
  try {
    const member = await TeamSection.create({
      type: 'member',
      title: name,      // name dari frontend → title di DB
      subtitle: role,   // role dari frontend → subtitle di DB
      image
    });
    
    // Return transformed data
    res.status(201).json({
      id: member.id,
      name: member.title,
      role: member.subtitle,
      image: member.image
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Gagal menambahkan anggota tim.' });
  }
};

// PUT /api/team/members/:id → Update member
exports.updateMember = async (req, res) => {
  const { id } = req.params;
  const { name, role, image } = req.body;  
  try {
    const member = await TeamSection.findByPk(id);
    if (!member || member.type !== 'member') {
      return res.status(404).json({ error: 'Anggota tidak ditemukan.' });
    }
    
    await member.update({ 
      title: name,     
      subtitle: role,   
      image 
    });
    
    // Return transformed data
    res.json({
      id: member.id,
      name: member.title,
      role: member.subtitle,
      image: member.image
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Gagal memperbarui anggota.' });
  }
};

// DELETE /api/team/members/:id → Delete member
exports.deleteMember = async (req, res) => {
  const { id } = req.params;
  try {
    const member = await TeamSection.findByPk(id);
    if (!member || member.type !== 'member') {
      return res.status(404).json({ error: 'Anggota tidak ditemukan.' });
    }
    await member.destroy();
    res.json({ message: 'Anggota berhasil dihapus.' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Gagal menghapus anggota.' });
  }
};