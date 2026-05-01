'use strict';

const router = require('express').Router({ mergeParams: true });
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const { listTasks, createTask, getTask, updateTask, deleteTask } = require('../controllers/taskController');
const { taskSchema, validate } = require('../validators/schemas');

router.use(verifyToken);

router.get('/', listTasks);
router.post('/', requireRole('Admin'), validate(taskSchema), createTask);
router.get('/:id', getTask);
// PUT is open to Admin & Member — RBAC enforced inside the controller
router.put('/:id', validate(taskSchema.partial()), updateTask);
router.delete('/:id', requireRole('Admin'), deleteTask);

module.exports = router;
