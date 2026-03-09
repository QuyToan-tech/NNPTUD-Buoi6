var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
let jwt = require('jsonwebtoken')
let { checkLogin } = require('../utils/authHandler.js')

/* GET home page. */
//localhost:3000
router.post('/register', async function (req, res, next) {
    let newUser = await userController.CreateAnUser(
        req.body.username,
        req.body.password,
        req.body.email,
        "69a5462f086d74c9e772b804"
    )
    res.send({
        message: "dang ki thanh cong"
    })
});
router.post('/login', async function (req, res, next) {
    let result = await userController.QueryByUserNameAndPassword(
        req.body.username, req.body.password
    )
    if (result) {
        let token = jwt.sign({
            id: result.id
        }, 'secret', {
            expiresIn: '1h'
        })
        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true
        });
        res.send(token)
    } else {
        res.status(404).send({ message: "sai THONG TIN DANG NHAP" })
    }

});
router.get('/me', checkLogin, async function (req, res, next) {
    console.log(req.userId);
    let getUser = await userController.FindUserById(req.userId);
    res.send(getUser);
})
router.post('/logout', checkLogin, function (req, res, next) {
    res.cookie('token', null, {
        maxAge: 0,
        httpOnly: true
    })
    res.send("da logout ")
})

router.post('/changePassword', checkLogin, async function (req, res, next) {
    try {
        let oldPassword = req.body.oldPassword;
        let newPassword = req.body.newPassword;
        let userId = req.userId;

        // Kiểm tra dữ liệu đầu vào
        if (!oldPassword || !newPassword) {
            return res.status(400).send({ 
                message: "oldPassword and newPassword are required" 
            });
        }

        // Gọi hàm đổi mật khẩu từ controller
        let result = await userController.ChangePassword(userId, oldPassword, newPassword);

        res.send({
            message: "doi mat khau thanh cong",
            user: {
                id: result._id,
                username: result.username,
                email: result.email
            }
        });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});



module.exports = router;
