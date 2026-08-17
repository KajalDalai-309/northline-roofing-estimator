import jwt from 'jsonwebtoken';

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'roofing2026!';
    const jwtSecret = process.env.JWT_SECRET || 'northline_super_secure_jwt_secret_2026_wantace_key';

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    if (username.trim() !== adminUser || password !== adminPass) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { username: adminUser, role: 'owner' },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        username: adminUser,
        role: 'owner',
        name: 'Dale Whitmore (Owner)'
      }
    });
  } catch (error) {
    console.error('[Auth Error]:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
}

export async function verifyToken(req, res) {
  return res.json({
    success: true,
    valid: true,
    user: req.user
  });
}
