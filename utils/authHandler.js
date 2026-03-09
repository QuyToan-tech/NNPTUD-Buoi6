let jwt = require('jsonwebtoken')
let userController = require('../controllers/users')

module.exports = {
    checkLogin: async function (req, res, next) {
        let token
        if (req.cookies.token) {
            token = req.cookies.token
        } else {
            token = req.headers.authorization;
            if (!token || !token.startsWith("Bearer")) {
                res.status(403).send("ban chua dang nhap")
                return;
            }
            token = token.split(' ')[1];
        }
        try {
            let result = jwt.verify(token, 'secret');
            if (result && result.exp * 1000 > Date.now()) {
                req.userId = result.id;
                next();
            } else {
                res.status(403).send("ban chua dang nhap")
            }
        } catch (error) {
            res.status(403).send("ban chua dang nhap")
        }
    },

    checkRole: function (...requiredRole) {
        return async function (req, res, next) {
            try {
                let userId = req.userId;
                let user = await userController.FindUserById(userId);
                let currentRole = user.role.name;
                if (requiredRole.includes(currentRole)) {
                    next();
                } else {
                    res.status(403).send({ message: "ban khong co quyen" });
                }
            } catch (error) {
                res.status(403).send({ message: "ban khong co quyen" });
            }
        }
    },

    checkRoleForProduct: function (...requiredRole) {
        return async function (req, res, next) {
            // Nếu không có userId, cho phép tiếp tục (cho GET không cần login)
            if (!req.userId) {
                return next();
            }

            try {
                let userId = req.userId;
                let user = await userController.FindUserById(userId);
                let currentRole = user.role.name;
                if (requiredRole.includes(currentRole)) {
                    next();
                } else {
                    res.status(403).send({ message: "ban khong co quyen" });
                }
            } catch (error) {
                res.status(403).send({ message: "ban khong co quyen" });
            }
        }
    },

    checkLoginOptional: async function (req, res, next) {
        let token
        if (req.cookies.token) {
            token = req.cookies.token
        } else {
            token = req.headers.authorization;
            if (!token || !token.startsWith("Bearer")) {
                // Không bắt buộc login, chỉ gán userId nếu có token
                return next();
            }
            token = token.split(' ')[1];
        }
        try {
            let result = jwt.verify(token, 'secret');
            if (result && result.exp * 1000 > Date.now()) {
                req.userId = result.id;
            }
            next();
        } catch (error) {
            // Token không hợp lệ, không yêu cầu login
            next();
        }
    }
}
