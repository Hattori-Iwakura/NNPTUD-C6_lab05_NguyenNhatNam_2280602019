var express = require('express');
var router = express.Router();
var Role = require('../models/role');

// Get all roles
router.get('/', async function(req, res, next) {
  try {
    const roles = await Role.find({ isDeleted: false });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get role by ID
router.get('/:id', async function(req, res, next) {
  try {
    const role = await Role.findById(req.params.id);
    if (!role || role.isDeleted) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(role);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create role
router.post('/', async function(req, res, next) {
  try {
    const { name, description } = req.body;
    const role = new Role({ name, description });
    await role.save();
    res.status(201).json(role);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update role
router.put('/:id', async function(req, res, next) {
  try {
    const { name, description } = req.body;
    const role = await Role.findByIdAndUpdate(
      req.params.id, 
      { name, description },
      { new: true, runValidators: true }
    );
    if (!role || role.isDeleted) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(role);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Soft delete role
router.delete('/:id', async function(req, res, next) {
  try {
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json({ message: 'Role soft deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
