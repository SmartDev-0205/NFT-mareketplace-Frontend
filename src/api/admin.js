const jwt = require('jsonwebtoken');
const { AdminController } = require('../controllers');

module.exports = {
    Create: async (req, res) => {
        try {
            const { name, email, password } = req.body;

            let check = await AdminController.find({
                param: email,
                flag: 2,
            });

            if (check) {
                res.status(303).end();
                return;
            }

            const result = await AdminController.create({
                name: name,
                email: email,
                password: password,
            });

            if (result) res.status(200).end();
        } catch (err) {
            console.log(err);
            res.status(500).end();
        }
    },
    Login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const admin = await AdminController.find({
                param: email,
                flag: 2,
            });
            if (!admin || admin.password !== password) {
                res.status(404).end();
                return;
            }
            const data = jwt.sign(admin._doc, process.env.JWT_SECRET, {
                expiresIn: '144h',
            });
            res.status(200).send(data);
        } catch (err) {
            console.log(err);
            res.status(500).end();
        }
    },
    Update: async (req, res) => {
        const {} = req.body;
    },
};
