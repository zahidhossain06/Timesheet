const Project = require('../models/Project');

const createProject = async (req, res) => {
    const { name, budgetedHours, assignedMembers } = req.body;
    try {
        const project = new Project({
            name,
            budgetedHours,
            assignedMembers,
        });
        const createdProject = await project.save();
        res.status(201).json(createdProject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getProjects = async (req, res) => {
    try {
        // In a real app, you might filter projects based on req.user.id
        const projects = await Project.find({});
        res.json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateProject = async (req, res) => {
    const { name, budgetedHours, assignedMembers } = req.body;
    try {
        const project = await Project.findById(req.params.id);

        if (project) {
            project.name = name ?? project.name;
            project.budgetedHours = budgetedHours ?? project.budgetedHours;
            project.assignedMembers = assignedMembers ?? project.assignedMembers;

            const updatedProject = await project.save();
            res.json(updatedProject);
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (project) {
            await project.deleteOne(); // Use deleteOne() for Mongoose v6+
            res.json({ message: 'Project removed' });
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


module.exports = {
    createProject,
    getProjects,
    updateProject,
    deleteProject,
};

