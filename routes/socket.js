const { Accounts } = require('./../models/Accounts')
const { Database } = require('./../config/models/database')
const fs = require('fs')
const UI_PATH = 'public/config/ui.json'

const retriveUI = () => {
    if (fs.existsSync(UI_PATH)) {
        const stringifiedUI = fs.readFileSync(UI_PATH)
        const jsonUI = JSON.parse(stringifiedUI)
        return jsonUI
    } else {
        return { data: [] }
    }
}


module.exports = (socket) => {
    socket.on("new-connected", (payload) => {
        console.log(payload)
    })

    socket.on("/dipe-production-user-login", async (payload) => {

        if (payload && payload.username) {
            const { username } = payload

            const defaultAccount = Accounts.__defaultAccount

            const jsonUI = retriveUI()

            let sessionAccount = undefined
            if (defaultAccount.username == username) {
                sessionAccount = defaultAccount
            } else {
                const Account = new Accounts()
                const accounts = await Account.findAll({ username })
                if (accounts && accounts[0]) {
                    sessionAccount = accounts[0]
                } else {
                    console.log("account khum tồn tại")
                }
            }

            if (sessionAccount != undefined) {
                socket.join(username)
                const uis = jsonUI.data ? jsonUI.data : [];
                const getApiURLs = uis.map(ui => {

                    const component = ui.components[0]
                    if (component) {
                        const keys = Object.keys(component)
                        keys.map(k => {
                            if (k && k.includes('api_')) {
                                socket.join(component[k].split('/')[2])
                            }
                        })
                    }

                })

            }
            socket.broadcast.emit("/dipe-production-user-login", { username })
        }
    })

    socket.on("/dipe-production-user-logout", (payload) => {
        const { username } = payload;
        socket.leave(username)
        const jsonUI = retriveUI()
        const uis = jsonUI.data ? jsonUI.data : [];

        const getApiURLs = uis.map(ui => {
            const component = ui.components[0]
            if (component) {
                const keys = Object.keys(component)
                keys.map(k => {
                    if (k && k.includes('api_')) {
                        socket.leave(component[k].split('/')[2])
                    }
                })
            }
        })
        // console.log("leave mot dong rooms")
    })

    socket.on("/dipe-production-import-ui", () => {
        const jsonUI = retriveUI()
        const uis = jsonUI.data ? jsonUI.data : [];

        const getApiURLs = uis.map(ui => {
            const component = ui.components[0]
            if (component) {
                const keys = Object.keys(component)
                keys.map(k => {
                    if (k && k.includes('api_')) {
                        socket.join(component[k].split('/')[2])
                    }
                })
            }
        })

        socket.broadcast.emit("/dipe-production-import-ui")
    })

    socket.on("/dipe-production-reconnect-ui", () => {
        const jsonUI = retriveUI()
        const uis = jsonUI.data ? jsonUI.data : [];
        console.log("reconnect ui")
        const getApiURLs = uis.map(ui => {
            const component = ui.components[0]
            if (component) {
                const keys = Object.keys(component)
                keys.map(k => {
                    if (k && k.includes('api_')) {
                        socket.join(component[k].split('/')[2])
                    }
                })
            }
        })
    })
    // not tested
    socket.on("/dipe-production-new-data-added", (payload) => {
        const { data, api_id } = payload;
        socket.to(api_id).emit("/dipe-production-new-data-added", { data, api_id })
    })

    socket.on("/dipe-production-delete-data", async (payload) => {
        const { data, api_id } = payload;
        const apis = await Database.selectAll('apis', { api_id })
        if (data && apis && apis[0]) {
            const table_id = apis[0].tables[0]
            const tables = await Database.selectAll("tables", { id: table_id })

            const table = tables[0]

            const primaryKeys = table.primary_key;
            const fields = await Database.selectAll("fields", { id: { $in: primaryKeys } })
            const key = {}
            for (let i = 0; i < fields.length; i++) {
                const field = fields[i]
                const { fomular_alias } = field;
                key[fomular_alias] = data[fomular_alias]
            }
            socket.to(api_id).emit("/dipe-production-delete-data", { data, api_id, current_page, key })
        }
    })

    socket.on("/dipe-production-update-data", async (payload) => {
        const { data, api_id } = payload;
        const apis = await Database.selectAll('apis', { api_id })
        if (data && apis && apis[0]) {
            const table_id = apis[0].tables[0]
            const tables = await Database.selectAll("tables", { id: table_id })

            const table = tables[0]

            const primaryKeys = table.primary_key;
            const fields = await Database.selectAll("fields", { id: { $in: primaryKeys } })
            const key = {}
            for (let i = 0; i < fields.length; i++) {
                const field = fields[i]
                const { fomular_alias } = field;
                key[fomular_alias] = data[fomular_alias]
            }

            // console.log(key)

            socket.to(api_id).emit("/dipe-production-update-data", { data, api_id, key })
        }
    })


    // console.log("Connected")
}
