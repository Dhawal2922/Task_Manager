'use strict';

const router = require('express').Router();
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const { projectSchema, validate } = require('../validators/schemas');

// All project routes require authentication
router.use(verifyToken);

router.get('/', listProjects);
router.post('/', requireRole('Admin'), validate(projectSchema), createProject);
router.get('/:id', getProject);
router.put('/:id', requireRole('Admin'), validate(projectSchema), updateProject);
router.delete('/:id', requireRole('Admin'), deleteProject);

// Member management (Admin only)
router.post('/:id/members', requireRole('Admin'), addMember);
router.delete('/:id/members/:userId', requireRole('Admin'), removeMember);

module.exports = router;
