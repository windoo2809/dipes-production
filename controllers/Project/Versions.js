const Crypto = require('../Crypto')
const Cache = require('../Cache/Cache')

const { Controller } = require('../../config/controllers');
const { Versions, VersionsRecord } = require('../../models/Versions');
const { ProjectMembers, ProjectMembersRecord } = require('../../models/ProjectMembers');
const { Accounts } = require('../../models/Accounts');
const { Projects } = require('../../models/Projects');
const { intValidate } = require('../../functions/validator');

const { Tables, TablesRecord } = require('../../models/Tables');
const { Fields, FieldsRecord } = require('../../models/Fields');
const { Apis, ApisRecord } = require('../../models/Apis');
const { Privileges, PrivilegesRecord } = require('../../models/Privileges')

const { Activation } = require('../../models/Activation');
const { Database } = require('../../config/models/database');

class VersionsController extends Controller {
    #__versions = undefined;
    #__projectMembers = undefined;
    #__accounts = undefined;    

    #__tables = new Tables();
    #__fields = new Fields();
    #__apis = new Apis();    
    #__projects = new Projects()
    #__keys = new Activation();
    #__privileges = new Privileges()


    constructor(){
        super();
        this.#__versions = new Versions()
        this.#__projectMembers = new ProjectMembers();
        this.#__accounts = new Accounts()
        this.#__projects = new Projects()
    }

    get = async ( req, res ) => {
        this.writeReq(req)

        /* Logical code goes here */

        this.writeRes({ status: 200, message: "Sample response" })
        res.status(200).send({
            success: true,
            content: "Sample response",
            data: []
        })
    }    

    getVersions = async ( req, res ) => {
        /* SCOPE: PROJECT */
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }
         * 
         * Request Params {
         *      project_id
         * } 
         * 
         */
        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }       

        const verified = await this.verifyToken( req );

        if( verified ){
            const decodedToken = this.decodeToken( req.header("Authorization") );
            const { username } = decodedToken;
            const account = await this.#__accounts.find({ username });
            if( account ){
                
                const rawProjectId = req.params.project_id;
                if( intValidate( rawProjectId ) ){
                    const project_id = parseInt( rawProjectId );
                    const project = await this.#__projects.find({ project_id })
                    if( project ){  
                        const versions = await this.#__versions.getAllProjectVersions( project_id ); 
                        context.content = "Thành công"
                        context.success = true;
                        context.status = "0x4501166" 
                        context.data = versions;
                    }else{
                        // not found
                        context.content = "Khum tìm thấy dự án"
                        context.status = "0x4501167"
                    }
                }else{
                    // bad request
                    context.content = "Request header khum hợp lệ"
                    context.status = "0x4501168"
                }
            }else{
                // accoun un avail able
                context.content = "Tài khoản của bạn khum khả dụng hoặc đã bị xóa"
                context.status = "0x4501169"
            }
        }else{
            context.content = "Token khum hợp lệ"
            context.status = "0x4501170"
        }
        res.status(200).send(context);
    }

    getOneVersion = async ( req, res ) => {
        /* SCOPE: PROJECT */
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }
         * 
         * Request Params {
         *      version_id
         * } 
         * 
         */
        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }       

        const verified = await this.verifyToken( req );

        if( verified ){
            const decodedToken = this.decodeToken( req.header("Authorization") );
            const { username } = decodedToken;
            const account = await this.#__accounts.find({ username });
            if( account ){                
                const Version = await this.getVersion( req.params.version_id )
                if( Version ){
                    const permission = await this.getProjectPrivilege( Version.project_id.value(), account.username )
                    if( permission ){                        
                        context.success = true
                        context.data = {
                            version: await Version.get()
                        }
                        context.status = "0x4501171"
                    }else{
                        context.content = "Bạn khum thuộc dự án này"
                        context.status = "0x4501172"
                    }
                }else{
                    // bad request
                    context.content = "Request header khum hợp lệ"
                    context.status = "0x4501173"
                }
            }else{
                // accoun un avail able
                context.content = "Tài khoản của bạn khum khả dụng hoặc đã bị xóa"
                context.status = "0x4501174"
            }
        }else{
            context.content = "Token khum hợp lệ"
            context.status = "0x4501175"
        }
        res.status(200).send(context);
    }

    duplicateVersion = async (req, res, privileges = ["ad", "pm"]) => {
        /* SCOPE: PROJECT */
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }
         * Request Body {
         *     project_id <Int>,
         *     version_id <Int>             
         *      
         * }
         * 
         */
    }

    updateVersion = async (req, res, privileges = ["ad", "pm"]) => {
        /* SCOPE: PROJECT */
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }
         * Request Body {
         *     project_id <Int>,
         *     version: {
         *         version_id <Int>,
         *         version_name <String>,
         *         version_description <String>
         *     }
         *      
         * }
         * 
         */

        const verified = await this.verifyToken(req);

        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }        
           
        res.status(200).send(context);
    }
    
    removeVersion = async ( req, res, privileges = ["ad"] ) => {
        /**
         *  Request Headers: {
         *      Authorization <Token>
         *  }
         * 
         *  Request Body {         
         *      version_id <Int>
         *  }
         */

        const verified = await this.verifyToken( req );

        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }

        if( verified ){
            /* No need to deploy this time */
        }else{
            context.content = "Token khum hợp lệ"
            context.status = "0x4501182"
        }
        res.status(200).send(context);
    }


    getProjectIDFromKey = ( key ) => {
        const { ACTIVATION_KEY } = key;
        const splittedKey = ACTIVATION_KEY.split('\n');
        const encryptRawProjectID = splittedKey[2];
        const encryptProjectID = encryptRawProjectID.replaceAll("-", "")        
        
        const Decipher = new Crypto()
        
        const rawProjectId = Decipher.decrypt( encryptProjectID )
        const isInt = intValidate( rawProjectId )
        if( isInt ){
            return parseInt( rawProjectId )
        }else{
            return undefined
        }
    }

    getTable = (tableId) => {
        const table = this.tables.find(tb => tb.id == tableId)
        return table;
    }

    
    findSlaveRecursive = (table, master) => {
        const { foreign_keys } = table;
        const slaveRelation = foreign_keys.find(key => key.table_id == master.id)

        if (slaveRelation) {
            return true
        } else {
            if (foreign_keys.length == 0) {
                return false
            } else {
                let found = false
                for (let i = 0; i < foreign_keys.length; i++) {
                    const { table_id } = foreign_keys[i]
                    const nextMaster = this.getTable(table_id)
                    if (!found) {
                        found = this.findSlaveRecursive(nextMaster, master)
                    }
                }
                return found
            }
        }
    }

    detectAllSlave = (master) => {
        const tables = this.tables;
        const slaves = []
        for (let i = 0; i < tables.length; i++) {
            const table = tables[i]
            let found = this.findSlaveRecursive(table, master)
            if (found) {
                slaves.push(table)
            }
        }
        return slaves
    }


    detectAllMaster = (slave) => {
        const tables = this.tables;
        const masters = []

        for (let i = 0; i < tables.length; i++) {
            const table = tables[i]

            const slaves = this.detectAllSlave(table)
            const isAMaster = slaves.find(tb => tb.id == slave.id)

            if (isAMaster) {
                masters.push(table)
            }
        }
        return masters
    }


    importDatabase = async ( req, res ) => {
        const { data } = req.body;

        const checkNull = this.notNullCheck( data, ["database"] )
        if( checkNull.valid ){
            const Decipher = new Crypto();
            const decryptedData =  Decipher.decrypt( data.database )
            const { database } = JSON.parse( decryptedData )
            const keys = await this.#__keys.findAll()
            const key = keys[0]

            
            
            if( key ){
                // const project_id = this.getProjectIDFromKey( key )
                // if( project_id != undefined ){
                    
                    if( database ){
                        const { project, tables, fields } = database;
                        const dbo = await Database.getDBO()
                        // console.log(project_id)
                        // console.log(project)
                        // if( project_id == project.project_id ){
                            const newFields = fields.map( field => {
                                const tearedField =  {  ...field, ...field.props }
                                delete tearedField.props;
                                return tearedField
                            })
                            await this.#__tables.deleteAll();
                            await this.#__fields.deleteAll();
                            await this.#__projects.deleteAll()
                            await this.#__privileges.deleteAll()
                    
                            await this.#__tables.insertMany( tables );
                            await this.#__fields.insertMany( newFields );   
                            await this.#__projects.insertMany( [ project ] )  
                            const accounts = await this.#__accounts.findAll()
                            const privileges = []
                            this.tables = tables;


                            const systemTables = [
                                { table_alias: "accounts", keys: [ "username" ] },
                                { table_alias: "table", keys: [ "id" ] },
                                { table_alias: "privileges", keys: [ "username", "table_id" ] }                                
                            ]

                            await Promise.all(systemTables.map( (table) => {
                                const { table_alias, keys } = table
                                const indexing = {}
                                keys.map( key => indexing[key] = 1 )
                                return dbo.collection(`${table_alias}`).createIndex( indexing )
                            }))

                            /** check indexing and privileges */

                            
                            for( let i = 0 ; i < tables.length; i++ ){
                                const table = tables[i]
                                const { primary_key, table_alias, foreign_keys } = table 
                                const indexing = {}
                                primary_key.map( field_id => {
                                    const primaryField = fields.find( f => f.id == field_id )
                                    if( primaryField ){
                                        indexing[primaryField.fomular_alias] = 1
                                    }
                                })
                                const masters = this.detectAllMaster(table)
                                for( let j = 0 ; j < masters.length; j++ ){
                                    const master = masters[j]
                                    const { primary_key } = master;
                                    const primary_fields =  fields.filter( field => primary_key.indexOf( field.id ) != -1 );
                                    const masterIndexing = {}
                                    primary_fields.map( field => {
                                        masterIndexing[field.fomular_alias] = 1
                                    })
                                    await dbo.collection(`${table_alias}`).createIndex( masterIndexing )                                
                                }                                

                                await Promise.all( foreign_keys.map( key => {
                                    const { field_id } = key;
                                    const field = fields.find( f => f.id == field_id )
                                    return dbo.collection(`${table_alias}`).createIndex( { [field.fomular_alias]: 1 } )                                
                                }))

                                if( primary_key.length > 0 ){                                    
                                    await dbo.collection(`${table_alias}`).createIndex( indexing )                                
                                }
                                await dbo.collection(`${table_alias}`).createIndex( { "position": 1 } )     
                                
                                
                                accounts.map( account => {
                                    const isAdmin = account.role == "ad" ? true : false;

                                    const privilege = {
                                        username: account.username,
                                        table_id: table.id,
                                        read: true,
                                        write: isAdmin,
                                        modify: isAdmin,
                                        purge: isAdmin
                                    }
                                    privileges.push( privilege )
                                })
                            }

                            await this.#__privileges.insertMany( privileges );                              
                            res.status(200).send({ success: true })
                        // }
                        // else{
                        //     res.status(200).send({ success: false, content: " Project khác với khóa " })    
                        // }
                    }else{
                        res.status(200).send({ success: false, content: "Khum tìm thấy dữ liệu" })
                    }
                // }
                // else{
                //     res.status(200).send({ success: false, content: "Khum tìm thấy project id trong khóa" })    
                // }
            }else{
                res.status(200).send({ success: false, content: "Chưa kích hoạt khóa mấy má oi" })
            }
        }else{
            res.status(200).send({ success: false , content: "Body bị null nhe má"})
        }
    }

    synchronizeAPIData = async ( api ) => {
        const table_id = api.tables[0]        
        const table = await this.#__tables.find({ id: table_id })
        if( table ){
            const { calculates, statistic } = api
            const fields = await this.#__fields.findAll({ table_id })
            const { table_alias } = table;
            const keys = fields.map( field => field.fomular_alias )
            keys.sort((key_1, key_2) => key_1.length > key_2.length ? 1 : -1);
            const oldSumerize = await Database.select(table_alias, { position: "sumerize" })
            console.log(api.api_name)  
            console.log(statistic.length)
            if( statistic.length > 0 ){

                if( oldSumerize != undefined && oldSumerize.total > 0){
                    const sumerize = {
                        total: oldSumerize.total
                    }                
                    const cache = await Cache.getData(`${ table_alias }-periods`)
                    if(cache){
                        const partitions = cache.value   
    
                        for( let i = 0; i < partitions.length; i++ ){
                            const { position } = partitions[i]
                            const data = await Database.selectAll( table_alias, { position } )                           
                            
                            for( let j = 0; j < data.length; j++ ){
                                const record = data[j]
                                
                                for (let k = 0; k < calculates.length; k++) {
                                    const { fomular_alias, fomular } = calculates[k]
                                    let result = fomular;
                                    keys.map(key => {
                                        /* replace the goddamn fomular with its coresponding value in record values */
                                        result = result.replaceAll(key, record[key])
                                    })
                                    try {
                                        record[fomular_alias] = eval(result)
                                    } catch {
                                        record[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
                                    }
                                }
        
        
                                for( let k = 0 ; k < statistic.length; k++ ){
                                    const data = record
                                    const statis = statistic[k]
                                    const { fomular_alias, field, group_by, fomular } = statis;
                                    const stringifyGroupKey = group_by.map(group => data[group]).join("_")
                                    const statisField = sumerize[fomular_alias];
                                    if (!statisField) {
                                        if (group_by && group_by.length > 0) {
                                            sumerize[fomular_alias] = {}
                                        } else {
                                            sumerize[fomular_alias] = 0
                                        }
                                    }
                                    if (fomular == "SUM") {
                                        if (typeof (data[field]) == "number") {
                                            if (group_by && group_by.length > 0) {
        
                                                if (!sumerize[fomular_alias][stringifyGroupKey]) {
                                                    sumerize[fomular_alias][stringifyGroupKey] = data[field]
                                                } else {
                                                    sumerize[fomular_alias][stringifyGroupKey] += data[field]
                                                }
                                            } else {
                                                sumerize[fomular_alias] += data[field]
                                            }
                                        }
                                    }
        
                                    if (fomular == "AVERAGE") {
                                        if (typeof (data[field]) == "number") {
                                            if (group_by && group_by.length > 0) {
        
                                                if (!sumerize[fomular_alias][stringifyGroupKey]) {
                                                    sumerize[fomular_alias][stringifyGroupKey] = {
                                                        total: 1,
                                                        value: data[field] 
                                                    }
                                                } else {
                                                    if( sumerize[fomular_alias][stringifyGroupKey].value ){
                                                        sumerize[fomular_alias][stringifyGroupKey].value = ( sumerize[fomular_alias][stringifyGroupKey].value * sumerize[fomular_alias][stringifyGroupKey].total  + data[field]) / ( sumerize[fomular_alias][stringifyGroupKey].total + 1 ) 
                                                    }else{
                                                        sumerize[fomular_alias][stringifyGroupKey].value = data[field]
                                                    }
                                                    sumerize[fomular_alias][stringifyGroupKey].total += 1
                                                }
                                            } else {
                                                sumerize[fomular_alias] = (sumerize[fomular_alias][stringifyGroupKey] * sumerize.total  + data[field]) / ( sumerize.total + 1 ) 
                                            }
                                        }
                                    }
        
                                    if (fomular == "COUNT") {
                                        if (group_by && group_by.length > 0) {
        
                                            if (!sumerize[fomular_alias][stringifyGroupKey]) {
                                                sumerize[fomular_alias][stringifyGroupKey] = 1
                                            } else {
                                                sumerize[fomular_alias][stringifyGroupKey] += 1
                                            }
                                        }
                                    }
                                }
        
        
                            }
                        }
                    }   
                            
                    Database.update(table_alias, {"position": "sumerize"}, { ...sumerize })
                }else{
                    console.log("No api found")        
                }
            }
        }else{
            console.log("Table not found")
        }
    }
    
    importAPI = async ( req, res ) => {
        const { data } = req.body;
        
        const checkNull = this.notNullCheck( data, ["apis"] )
        if( checkNull.valid ){

            const Decipher = new Crypto();
            const decryptedData =  Decipher.decrypt( data.apis )
            const { apis } = JSON.parse( decryptedData )
            if( apis ){
                await this.#__apis.deleteAll()

                
                const syncAPIs = apis.filter( api => {
                    const { url, api_method } = api;
                    const apiType = url.split('/')[1]
                    if( apiType=="ui" && api_method == "post" ){
                        return true
                    }
                    return false
                })               
                await this.#__apis.insertMany(apis)
                
                for( let i = 0 ; i < syncAPIs.length; i++ ){
                    await this.synchronizeAPIData(syncAPIs[i])
                }
                res.status(200).send({ success: true })
            }else{
                res.status(200).send({ success: false })
            }
        }else{
            res.status(200).send({ success: false })
        }
    }
}
module.exports = VersionsController

    