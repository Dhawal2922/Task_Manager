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
    const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);
    const sevenDaysLaterStr = sevenDaysLater.getFullYear() + '-' + String(sevenDaysLater.getMonth() + 1).padStart(2, '0') + '-' + String(sevenDaysLater.getDate()).padStart(2, '0');

    let taskWhere = {};

    // Members only see stats for their own assigned tasks
    if (req.user.role === 'Member') {
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
        due_date: { [Op.lt]: todayStr },
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
          [Op.gte]: todayStr,
          [Op.lte]: sevenDaysLaterStr,
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
