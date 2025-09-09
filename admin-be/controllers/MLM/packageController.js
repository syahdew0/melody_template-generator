const Package = require("../models/Package");

exports.getAllPackages = async (req, res) => {
  const packages = await Package.findAll();
  res.json(packages);
};

exports.getPackageById = async (req, res) => {
  const pkg = await Package.findByPk(req.params.id);
  if (!pkg) return res.status(404).json({ message: "Package not found" });
  res.json(pkg);
};

exports.createPackage = async (req, res) => {
  const pkg = await Package.create(req.body);
  res.status(201).json(pkg);
};

exports.updatePackage = async (req, res) => {
  const pkg = await Package.findByPk(req.params.id);
  if (!pkg) return res.status(404).json({ message: "Package not found" });
  await pkg.update(req.body);
  res.json(pkg);
};

exports.deletePackage = async (req, res) => {
  const pkg = await Package.findByPk(req.params.id);
  if (!pkg) return res.status(404).json({ message: "Package not found" });
  await pkg.destroy();
  res.json({ message: "Package deleted" });
};
