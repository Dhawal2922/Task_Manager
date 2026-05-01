'use strict';

/**
 * models/index.js — Association Hub
 *
 * All Sequelize associations live here, not inside individual models.
 * This prevents circular requires while keeping the relationship graph
 * in one auditable place.
 */

const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const Task = require('./Task');

// ─── User ↔ Project (creator) ────────────────────────────────────────────────
User.hasMany(Project, { foreignKey: 'creator_id', as: 'createdProjects' });
Project.belongsTo(User, { foreignKey: 'creator_id', as: 'creator' });

// ─── User ↔ Project (membership M:N via ProjectMember) ───────────────────────
User.belongsToMany(Project, {
  through: ProjectMember,
  foreignKey: 'user_id',
  otherKey: 'project_id',
  as: 'memberProjects',
});
Project.belongsToMany(User, {
  through: ProjectMember,
  foreignKey: 'project_id',
  otherKey: 'user_id',
  as: 'members',
});

// Direct hasMany / belongsTo for easier queries on the join table
Project.hasMany(ProjectMember, { foreignKey: 'project_id', as: 'projectMembers' });
ProjectMember.belongsTo(Project, { foreignKey: 'project_id' });
User.hasMany(ProjectMember, { foreignKey: 'user_id' });
ProjectMember.belongsTo(User, { foreignKey: 'user_id', as: 'member' });

// ─── Task ↔ Project ──────────────────────────────────────────────────────────
Project.hasMany(Task, { foreignKey: 'project_id', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// ─── Task ↔ User (assignee) ──────────────────────────────────────────────────
User.hasMany(Task, { foreignKey: 'assigned_to_id', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assigned_to_id', as: 'assignee' });

module.exports = { sequelize, User, Project, ProjectMember, Task };
