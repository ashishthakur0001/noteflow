const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

const usersRef = db.collection('users');

const defaultPreferences = {
  theme: 'light',
  defaultView: 'grid',
  fontSize: 'medium',
};

const nowIso = () => new Date().toISOString();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const toPublicUser = (id, data) => ({
  id,
  name: data.name,
  email: data.email,
  preferences: data.preferences || defaultPreferences,
  createdAt: data.createdAt,
});

const findUserByEmail = async (email) => {
  const snapshot = await usersRef.where('email', '==', email.toLowerCase()).limit(1).get();
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    if (String(name).trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const timestamp = nowIso();
    const doc = await usersRef.add({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      avatar: '',
      preferences: defaultPreferences,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    const userData = (await doc.get()).data();
    const token = generateToken(doc.id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: toPublicUser(doc.id, userData),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: toPublicUser(user.id, user),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMe = async (req, res) => {
  res.json({
    success: true,
    user: toPublicUser(req.user.id, req.user),
  });
};

const updateProfile = async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const updates = { updatedAt: nowIso() };

    if (name) updates.name = name.trim();
    if (preferences) {
      updates.preferences = {
        ...defaultPreferences,
        ...(req.user.preferences || {}),
        ...preferences,
      };
    }

    await usersRef.doc(req.user.id).update(updates);
    const updated = await usersRef.doc(req.user.id).get();

    res.json({
      success: true,
      message: 'Profile updated',
      user: toPublicUser(updated.id, updated.data()),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const isMatch = await bcrypt.compare(currentPassword, req.user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await usersRef.doc(req.user.id).update({ passwordHash, updatedAt: nowIso() });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
