import jwt from 'jsonwebtoken';

/**
 * Authentication middleware supporting both Bearer JWT and HTTP Basic Auth
 */
export function requireOwnerAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Owner Panel"');
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'roofing2026!';
  const jwtSecret = process.env.JWT_SECRET || 'northline_super_secure_jwt_secret_2026_wantace_key';

  // 1. Check for Bearer JWT Token
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired authentication token.' });
    }
  }

  // 2. Check for Basic Auth
  if (authHeader.startsWith('Basic ')) {
    try {
      const credentials = Buffer.from(authHeader.split(' ')[1] || '', 'base64').toString('utf-8').split(':');
      const user = credentials[0];
      const pass = credentials[1];

      if (user === adminUser && pass === adminPass) {
        req.user = { username: user, role: 'owner' };
        return next();
      }
    } catch (err) {
      // ignore base64 parse error and proceed to 401
    }
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Owner Panel"');
  return res.status(401).json({ error: 'Invalid admin credentials.' });
}
