const {connection} = require('../config/mysql')
const DATABASE_NAME = process.env.SQL_DATABASE || 'db_test'

getData = (message = '', callback) => connection.query(
    `SELECT * FROM ${DATABASE_NAME}.initial WHERE keywords LIKE '%${message}%'  LIMIT 1`,
    (error, results
        ) => {
    const [response] = results
    const key = response?.option_key || null
    callback(key)
});


getReply = (option_key = '', callback) => connection.query(
    `SELECT * FROM ${DATABASE_NAME}.response WHERE option_key = '${option_key}'  LIMIT 1`,
    (error, results
        ) => {
    const [response] = results;
    console.log(response)
    const value = {
        replyMessage:response?.replyMessage || '',
        trigger:response?.trigger || '',
        media:response?.media || ''
     
    }
    callback(value)
});

getMessages = ( number ) => new Promise((resolve,reejct) => {
    try {
        connection.query(
        `SELECT * FROM ${DATABASE_NAME}.response WHERE number = '${number}'`, (error, results) => {
            if(error) {
                console.log(error)
            }
            const [response] = results;
            console.log(response)
            const value = {
                replyMessage:response?.replyMessage || '',
                trigger:response?.trigger || '',
                media:response?.media || ''
            }
            resolve(value)
        })
    } catch (error) {
        
    }
})

saveMessageMysql = ( message, date, trigger, number ) => new Promise((resolve,reejct) => {
    try {
        connection.query(
        `INSERT INTO ${DATABASE_NAME}.messages  `+"( `message`, `date`, `trigger`, `number`)"+` VALUES ('${message}','${date}','${trigger}', '${number}')` , (error, results) => {
            if(error) {
                
                console.log('DEBES DE CREAR LA TABLA DE MESSAGE')
            }
            console.log('Saved')
            console.log( results )
            resolve(results)
        })
    } catch (error) {
        
    }
})

module.exports = {getData, getReply, saveMessageMysql}