/** @format */
const ADMIN = require('../models/admin');

const AdminController = {
    create: async (props) => {
        const { name, email, password } = props;

        const newAdmin = new ADMIN({
            name: name,
            email: email,
            password: password,
        });
        let adminData = await newAdmin.save();

        return adminData;
    },
    find: async (props) => {
        const { param, flag } = props;

        let result;
        switch (flag) {
            case 1: // name check
                result = await ADMIN.findOne({ name: param });
                break;
            case 2: // email check
                result = await ADMIN.findOne({ email: param });
                break;
            default:
                break;
        }

        return result;
    },
};

module.exports = { AdminController };
