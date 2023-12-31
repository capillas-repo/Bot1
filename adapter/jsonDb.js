const Path = require('path');
const StormDB = require("stormdb");
const date = new Date().toISOString();

const saveMessageJson = (message, trigger, number, regla) => new Promise( async(resolve, reject) => {
    try {
        const engine = new StormDB.localFileEngine( Path.join(__dirname, `/../chats/${number}.json`) );
        const db = new StormDB(engine);  
        
        db.default({ messages: [] });
        db.get("messages").push({ message, date, trigger, regla });
        db.save();
        resolve('Saved');
    } catch (error) {
        console.log(error);
        reject(error);
    }
});

module.exports = { saveMessageJson };
