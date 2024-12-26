
export function requireAuth(req, res, next) {
  if (!req.session.userId) {
    res.status(401).json({ success: false, errorMessage: 'Not authorized' });
  } else {
    next();
  }
}
