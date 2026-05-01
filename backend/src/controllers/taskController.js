'use strict';

const { Op } = require('sequelize');
const { Task, Project, User, ProjectMember } = require('../models');

/** GET /api/projects/:projectId/tasks */
const listTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    await assertProjectAccess(projectId, req.user, res);

    const { status, priority, assigned_to_id } = req.query;
    const where = { project_id: projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigned_to_id) where.assigned_to_id = assigned_to_id;

    const tasks = await Task.findAll({
      where,
      include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }],
      order: [['due_date', 'ASC NULLS LAST'], ['createdAt', 'DESC']],
    });
    return res.status(200).json({ success: true, data: { tasks } });
  } catch (err) {
    next(err);
  }
};

/** POST /api/projects/:projectId/tasks — Admin only */
const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    const { title, description, status, priority, due_date, assigned_to_id } = req.body;

    // Validate assignee is a member of this project
    if (assigned_to_id) {
      const membership = await ProjectMember.findOne({ where: { project_id: projectId, user_id: assigned_to_id } });
      if (!membership) {
        return res.status(422).json({ success: false, message: 'Assignee is not a member of this project.' });
      }
    }

    const task = await Task.create({ title, description, status, priority, due_date, project_id: projectId, assigned_to_id });
    return res.status(201).json({ success: true, message: 'Task created.', data: { task } });
  } catch (err) {
    next(err);
  }
};

/** GET /api/projects/:projectId/tasks/:id */
const getTask = async (req, res, next) => {
  try {
    const task = await findTaskOrFail(req.params.id, req.params.projectId, req.user, res);
    if (!task) return;
    return res.status(200).json({ success: true, data: { task } });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/projects/:projectId/tasks/:id — Admin: full update; Member: status only on their own tasks */
const updateTask = async (req, res, next) => {
  try {
    const task = await findTaskOrFail(req.params.id, req.params.projectId, req.user, res);
    if (!task) return;

    if (req.user.role === 'Member') {
      // Members can ONLY change the status of tasks assigned to them
      if (task.assigned_to_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'You can only update tasks assigned to you.' });
      }
      if (req.body.status === undefined) {
        return res.status(422).json({ success: false, message: 'Members can only update task status.' });
      }
      await task.update({ status: req.body.status });
    } else {
      // Admin: full update
      const { title, description, status, priority, due_date, assigned_to_id } = req.body;
      if (assigned_to_id) {
        const membership = await ProjectMember.findOne({
          where: { project_id: req.params.projectId, user_id: assigned_to_id },
        });
        if (!membership) {
          return res.status(422).json({ success: false, message: 'Assignee is not a member of this project.' });
        }
      }
      await task.update({ title, description, status, priority, due_date, assigned_to_id });
    }

    return res.status(200).json({ success: true, message: 'Task updated.', data: { task } });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/projects/:projectId/tasks/:id — Admin only */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, project_id: req.params.projectId },
    });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    await task.destroy();
    return res.status(200).json({ success: true, message: 'Task deleted.' });
  } catch (err) {
    next(err);
  }
};

// ─── Helper ──────────────────────────────────────────────────────────────────

async function assertProjectAccess(projectId, user, res) {
  if (user.role !== 'Admin') {
    const membership = await ProjectMember.findOne({ where: { project_id: projectId, user_id: user.id } });
    if (!membership) {
      res.status(403).json({ success: false, message: 'Access denied to this project.' });
      return false;
    }
  }
  return true;
}

async function findTaskOrFail(taskId, projectId, user, res) {
  const task = await Task.findOne({
    where: { id: taskId, project_id: projectId },
    include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }],
  });
  if (!task) {
    res.status(404).json({ success: false, message: 'Task not found.' });
    return null;
  }
  const access = await assertProjectAccess(projectId, user, res);
  if (!access) return null;
  return task;
}

module.exports = { listTasks, createTask, getTask, updateTask, deleteTask };
