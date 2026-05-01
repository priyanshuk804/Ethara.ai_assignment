const Task = require('../models/Task');
const Project = require('../models/Project');
const { taskValidation } = require('../utils/validators');

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  const { error } = taskValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { title, description, status, dueDate, project, assignedTo } = req.body;

  try {
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = new Task({
      title,
      description,
      status,
      dueDate,
      project,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
    });

    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    let filter = {};

    if (projectId) {
      filter.project = projectId;
    }

    if (req.user.role !== 'Admin') {
      // Member can only see tasks in projects they belong to
      const userProjects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      
      if (projectId && !projectIds.some(id => id.toString() === projectId)) {
        return res.status(403).json({ message: 'Not authorized for this project' });
      } else if (!projectId) {
        filter.project = { $in: projectIds };
      }
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .populate('createdBy', 'name');
      
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Admins can update anything. Members can only update status if assigned to them.
    if (req.user.role !== 'Admin') {
      if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
      // Only allow updating status for members
      if (req.body.status) {
        task.status = req.body.status;
      }
    } else {
      // Admin updating all fields
      const { error } = taskValidation(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      task.title = req.body.title || task.title;
      task.description = req.body.description !== undefined ? req.body.description : task.description;
      task.status = req.body.status || task.status;
      task.dueDate = req.body.dueDate !== undefined ? req.body.dueDate : task.dueDate;
      task.project = req.body.project || task.project;
      task.assignedTo = req.body.assignedTo !== undefined ? req.body.assignedTo : task.assignedTo;
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      await task.deleteOne();
      res.json({ message: 'Task removed' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
