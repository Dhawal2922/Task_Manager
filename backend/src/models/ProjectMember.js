'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * ProjectMember — join table for many-to-many User ↔ Project.
 * A User can be in many Projects; a Project can have many Users.
 */
const ProjectMember = sequelize.define(
  'ProjectMember',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    project_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'projects', key: 'id' },
      onDelete: 'CASCADE',
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
  },
  {
    tableName: 'project_members',
    timestamps: true,
    indexes: [
      // Composite unique: one user per project
      { unique: true, fields: ['project_id', 'user_id'] },
    ],
  }
);

module.exports = ProjectMember;
