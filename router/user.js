const express = require('express');
const multer = require('multer');
const User = require('../models/user');
const router = new express.Router();
const auth = require("../middleware/auth");

router.post('/user', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(200).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
})

router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
})

router.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send(e);
    }
})

router.post('/user/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send(e);
    }
})

router.get('/users', auth, async (req, res) => {
    // try {
    //     const users = await User.find({});
    //     res.status(200).send(users);
    // } catch (e) {
    //     res.status(400).send(e);
    // }
    res.send(req.user);
})

router.patch('/users/update', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password'];
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update);
    })
    if (!isValidOperation) {
        res.status(404).send("Invalid Update");
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();
        res.status(200).send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
})

router.delete('/users/delete', auth, async (req, res) => {
    try {
        await req.user.remove();
        res.status(200).send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        // if (!file.originalname.endsWith('.pdf')) {
        //     return cb(new Error('File must be a PDF'));
        // }
        // if (!file.originalname.match(/\.(doc|docx)$/)) {
        //     return cb(new Error('File must be in Word Format'));
        // }
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File must be an Image'));
        }
        cb(undefined, true);
    }
});

router.post('/users/avatar', auth, upload.single('upload'), async (req, res) => {
    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.status(200).send("Avatar Saved Successfully");
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
})

router.delete('/users/delete/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).send("Avatar Deleted Successfully");
}, (error, req, res, next) => {
    res.status(400).send({ error: "Unable to Delete Your Avatar" });
})

router.get('/users/avatar/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            res.status(404).send("Unable to get User Details or Avatar");
        }
        res.set('Content-Type', 'image/jpg');
        res.status(200).send(user.avatar);
    } catch (e) {
        res.status(500).send(e);
    }
})

module.exports = router;
