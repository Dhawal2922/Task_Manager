'use strict';

const { Op } = require('sequelize');
const { Task, Project, User, ProjectMember } = require('../models');

/**
 * GET /api/dashboard/stats
 *
 * Returns:
 *  - taskCounts: { Todo, In-Progress, Done }
 *  - overdueTasks: tasks past due_date & not Done
 *  - upcomingDeadlines: tasks due in the next 7 days
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    let taskWhere = {};

    // Members only see stats for their own assigned tasks & their projects
    if (req.user.role === 'Member') {
      // Get IDs of projects the user is a member of
      const memberships = await ProjectMember.findAll({ where: { user_id: req.user.id } });
      const projectIds = memberships.map((m) => m.project_id);
      taskWhere.project_id = { [Op.in]: projectIds };
      taskWhere.assigned_to_id = req.user.id;
    }

    // ─── Task Counts by Status ────────────────────────────────────────────────
    const [todoCount, inProgressCount, doneCount] = await Promise.all([
      Task.count({ where: { ...taskWhere, status: 'Todo' } }),
      Task.count({ where: { ...taskWhere, status: 'In-Progress' } }),
      Task.count({ where: { ...taskWhere, status: 'Done' } }),
    ]);

    // ─── Overdue Tasks ────────────────────────────────────────────────────────
    const overdueTasks = await Task.findAll({
      where: {
        ...taskWhere,
        due_date: { [Op.lt]: today.toISOString().split('T')[0] },
        status: { [Op.ne]: 'Done' },
      },
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
      order: [['due_date', 'ASC']],
      limit: 20,
    });

    // ─── Upcoming Deadlines (next 7 days) ─────────────────────────────────────
    const upcomingDeadlines = await Task.findAll({
      where: {
        ...taskWhere,
        due_date: {
          [Op.gte]: today.toISOString().split('T')[0],
          [Op.lte]: sevenDaysLater.toISOString().split('T')[0],
        },
        status: { [Op.ne]: 'Done' },
      },
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
      order: [['due_date', 'ASC']],
      limit: 20,
    });

    // ─── Top-level Project Summary (Admin only) ───────────────────────────────
    let projectSummary = null;
    if (req.user.role === 'Admin') {
      const totalProjects = await Project.count();
      const totalUsers = await User.count();
      projectSummary = { totalProjects, totalUsers };
    }

    return res.status(200).json({
      success: true,
      data: {
        taskCounts: {
          Todo: todoCount,
          'In-Progress': inProgressCount,
          Done: doneCount,
          total: todoCount + inProgressCount + doneCount,
        },
        overdueTasks,
        upcomingDeadlines,
        ...(projectSummary && { projectSummary }),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats };
