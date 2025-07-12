const { VisiMisi } = require("../models");

exports.getVisiMisi = async (req, res) => {
  try {
    let data = await VisiMisi.findOne({ where: { id: 1 } });

    if (!data) {
      data = await VisiMisi.create({
        title: '',
        subtitle: '',
        visi: '',
        misi: [''],
        stats: [
          { label: 'Years of Experience', value: 0 },
          { label: 'Completed Projects', value: 0 },
          { label: 'Happy Clients', value: 0 }
        ]
      });
    }

    const parsedData = {
      ...data.toJSON(),
      misi: typeof data.misi === 'string' ? JSON.parse(data.misi) : data.misi,
      stats: typeof data.stats === 'string' ? JSON.parse(data.stats) : data.stats,
    };

    res.json(parsedData);
  } catch (error) {
    console.error('Gagal ambil data VisiMisi:', error);
    res.status(500).json({ message: "Gagal mengambil data", error });
  }
};


exports.saveVisiMisi = async (req, res) => {
  try {
    const { title, subtitle, visi, misi, stats } = req.body;

    const existing = await VisiMisi.findOne({ where: { id: 1 } });

    if (existing) {
      await existing.update({ title, subtitle, visi, misi, stats });
    } else {
      await VisiMisi.create({ id: 1, title, subtitle, visi, misi, stats });
    }

    res.json({ message: "Data berhasil disimpan" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menyimpan data", error });
  }
};
