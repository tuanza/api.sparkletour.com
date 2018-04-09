const Router = require('koa-router')
const router = new Router({
    prefix: '/users'
});
const ResultInfo = require('../common/ResultInfo')
const udeskDAO = {
    mongodb: require('../daos/mongodb/udeskDAO')
}
const userRoleDAO = {
    mongodb: require('../daos/mongodb/userRoleDAO')
}

//获取所有用户
router.get('/', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var rs = await udeskDAO.mongodb.agent.find({}, {}, 50)
        ri.succ(rs)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

//获取所有用户角色列表
router.get('/roles', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var rs = await userRoleDAO.mongodb.find({}, { id: 1, name: 1 }, 50)
        ri.succ(rs)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

//按用户id获取用户详情
router.get('/:id', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var id = parseInt(ctx.params.id)
        var user = await udeskDAO.mongodb.agent.get({ "id": id })
        if (user) {
            ri.succ(user)
        }
        else {
            ri.error('没有数据')
        }
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

//用户登录
router.post('/login', async function (ctx, next) {
    var ri = new ResultInfo()
    var login_name = ctx.request.body.login_name || ''
    var login_pass = ctx.request.body.login_pass || ''
    if (login_name == '') {
        ri.error('请输入用户名')
    }
    else if (login_pass == '') {
        ri.error('请输入密码')
    }
    else {
        try {
            var fields = { id: 1, email: 1, nick_name: 1, cellphone: 1, user_group_ids: 1, role_id: 1 }
            var arr = await udeskDAO.mongodb.agent.find({ login_name: login_name, login_pass: login_pass }, fields, 1)
            if (arr && arr.length > 0) {
                var user = arr[0]
                var roleId = user.role_id || 0
                if (roleId > 0) {
                    var role = await userRoleDAO.mongodb.get({ id: roleId })
                    user['role'] = role
                }
                ri.succ(user)
            }
            else {
                ri.error('用户名密码错误')
            }
        }
        catch (err) {
            ri.error(err)
        }
    }

    ctx.response.body = ri;
})

//新增用户信息
router.post('/', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var insertData = ctx.request.body
        var rs = await udeskDAO.mongodb.agent.add(insertData)
        if (rs.result && rs.result.ok == 1) {
            ri.succ(rs)
        }
        else {
            ri.error('更新失败')
        }
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

//修改用户信息
router.post('/:id', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var id = parseInt(ctx.params.id)
        var updateData = ctx.request.body
        var rs = await udeskDAO.mongodb.agent.update(id, updateData)
        if (rs.result && rs.result.ok == 1) {
            ri.succ('', '更新成功')
        }
        else {
            ri.error('更新失败')
        }

    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

//修改用户信息
router.post('/:id/uppass', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var id = parseInt(ctx.params.id)
        var updateData = ctx.request.body
        var rs = await udeskDAO.mongodb.agent.get({ 'id': id })
        if (rs && rs.login_pass == updateData.login_pass_org) {
            updateData = { "login_pass": updateData.login_pass }
            rs = await udeskDAO.mongodb.agent.update(id, updateData)
            if (rs.result && rs.result.ok == 1) {
                ri.succ('', '更新成功')
            }
            else {
                ri.error('更新失败')
            }
        }
        else {
            ri.error('原始密码错误')
        }
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})



//按id获取角色详情
router.get('/roles/:id', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var id = parseInt(ctx.params.id)
        var rs = await userRoleDAO.mongodb.get({ 'id': id })
        if (rs) {
            ri.succ(rs)
        }
        else {
            ri.error('没有数据')
        }
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

//更新角色信息
router.post('/roles/:id', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var id = parseInt(ctx.params.id)
        var updateData = ctx.request.body
        var rs = await userRoleDAO.mongodb.update(id, updateData, true)
        if (rs.result && rs.result.n > 0) {
            ri.succ('更新成功')
        }
        else {
            ri.error('更新失败')
        }

    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

module.exports = router