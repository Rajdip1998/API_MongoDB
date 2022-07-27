const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/task', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });
    try {
        await task.save();
        res.status(200).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
})

router.get('/tasks', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ owner: req.user._id, completed: req.query.completed }).limit(req.query.limit).skip(req.query.skip).sort('-createdAt');
        res.status(200).send(tasks);
    } catch (e) {
        res.status(400).send(e);
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const ID = req.params.id;
    try {
        const tasks = await Task.findOne({ ID, owner: req.user._id });
        if (!tasks) {
            res.status(404).send("No Task Exists with this ID");
        }
        res.status(200).send(tasks);
    } catch (e) {
        res.status(500).send(e);
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['task', 'description', 'completed'];
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update);
    })
    if (!isValidOperation) {
        res.status(404).send("Invalid Update");
    }
    try {
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
        if (!task) {
            res.status(404).send("No Task Exists with this ID");
        }
        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        res.status(200).send(task);
    } catch (e) {
        res.status(500).send(e);
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
        await task.remove();
        res.status(200).send(task);
    } catch (e) {
        res.status(500).send(e);
    }
})

module.exports = router;
