'use strict';

const { Op } = require('sequelize');
const { Project, User, ProjectMember, Task } = require('../models');

/** GET /api/projects — returns projects the user is part of */
const listProjects = async (req, res, next) => {
  try {
    let projects;
    if (req.user.role === 'Admin') {
      projects = await Project.findAll({
        include: [
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'], through: { attributes: [] } },
        ],
        order: [['createdAt', 'DESC']],
      });
    } else {
      projects = await Project.findAll({
        include: [
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
          {
            model: User,
            as: 'members',
            attributes: ['id', 'name', 'email', 'role'],
            through: { attributes: [] },
            where: { id: req.user.id },
          },
        ],
        order: [['createdAt', 'DESC']],
      });
    }
    return res.status(200).json({ success: true, data: { projects } });
  } catch (err) {
    next(err);
  }
};

/** POST /api/projects — Admin only */
const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({ name, description, creator_id: req.user.id });

    // Creator is auto-added as a member
    await ProjectMember.create({ project_id: project.id, user_id: req.user.id });

    return res.status(201).json({ success: true, message: 'Project created.', data: { project } });
  } catch (err) {
    next(err);
  }
};

/** GET /api/projects/:id */
const getProject = async (req, res, next) => {
  try {
    const project = await findProjectOrFail(req.params.id, req.user, res);
    if (!project) return;

    const full = await Project.findByPk(project.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'], through: { attributes: [] } },
        { model: Task, as: 'tasks', include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }] },
      ],
    });

    return res.status(200).json({ success: true, data: { project: full } });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/projects/:id — Admin only */
const updateProject = async (req, res, next) => {
  try {
    const project = await findProjectOrFail(req.params.id, req.user, res);
    if (!project) return;

    const { name, description } = req.body;
    await project.update({ name, description });

    return res.status(200).json({ success: true, message: 'Project updated.', data: { project } });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/projects/:id — Admin only */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    await project.destroy();
    return res.status(200).json({ success: true, message: 'Project deleted.' });
  } catch (err) {
    next(err);
  }
};

/** POST /api/projects/:id/members — Admin: add user to project */
const addMember = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(422).json({ success: false, message: 'user_id is required.' });
    }

    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    const target = await User.findByPk(user_id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found.' });

    const [, created] = await ProjectMember.findOrCreate({
      where: { project_id: project.id, user_id },
    });

    if (!created) {
      return res.status(409).json({ success: false, message: 'User is already a member.' });
    }
    return res.status(201).json({ success: true, message: 'Member added.' });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/projects/:id/members/:userId — Admin: remove user */
const removeMember = async (req, res, next) => {
  try {
    const deleted = await ProjectMember.destroy({
      where: { project_id: req.params.id, user_id: req.params.userId },
    });
    if (!deleted) return res.status(404).json({ success: false, message: 'Membership not found.' });
    return res.status(200).json({ success: true, message: 'Member removed.' });
  } catch (err) {
    next(err);
  }
};

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * findProjectOrFail — for non-destructive operations on a project.
 * Admin: any project. Member: only projects they belong to.
 */
async function findProjectOrFail(id, user, res) {
  const project = await Project.findByPk(id);
  if (!project) {
    res.status(404).json({ success: false, message: 'Project not found.' });
    return null;
  }
  if (user.role !== 'Admin') {
    const membership = await ProjectMember.findOne({
      where: { project_id: id, user_id: user.id },
    });
    if (!membership) {
      res.status(403).json({ success: false, message: 'Access denied to this project.' });
      return null;
    }
  }
  return project;
}

module.exports = { listProjects, createProject, getProject, updateProject, deleteProject, addMember, removeMember };
