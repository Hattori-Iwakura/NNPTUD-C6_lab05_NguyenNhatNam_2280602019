var express = require('express');
var router = express.Router();
var User = require('../models/user');

/* GET all users (isDeleted: false) */
router.get('/', async function(req, res, next) {
  try {
    const users = await User.find({ isDeleted: false }).populate('role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* GET user by ID */
router.get('/:id', async function(req, res, next) {
  try {
    const user = await User.findById(req.params.id).populate('role');
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Create User */
router.post('/', async function(req, res, next) {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* Update User - PUT is idempotent usually, but often used for full updates. Patch for partial. Using PUT here as requested generally.  */
router.put('/:id', async function(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* Soft Delete User */
router.delete('/:id', async function(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User soft deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* POST /enable */
router.post('/enable', async function(req, res, next) {
  try {
    const { email, username } = req.body;
    // Condition to enable: must provide valid email AND username
    const user = await User.findOneAndUpdate(
      { email: email, username: username, isDeleted: false },
      { status: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found or incorrect info' });
    }
    res.json({ message: 'User enabled successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* POST /disable */
router.post('/disable', async function(req, res, next) {
  try {
    const { email, username } = req.body;
    const user = await User.findOneAndUpdate(
      { email: email, username: username, isDeleted: false },
      { status: false },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found or incorrect info' });
    }
    res.json({ message: 'User disabled successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
