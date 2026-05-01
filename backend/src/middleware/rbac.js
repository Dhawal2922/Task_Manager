'use strict';

/**
 * requireRole(...roles) — RBAC guard factory.
 *
 * Usage:  router.delete('/:id', verifyToken, requireRole('Admin'), handler)
 *
 * Returns 403 if the authenticated user's role is not in the allowed list.
 * Placing this AFTER verifyToken guarantees req.user is populated.
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires role: ${roles.join(' or ')}.`,
      });
    }
    next();
  };
};

module.exports = requireRole;
