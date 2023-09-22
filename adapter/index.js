const { getData, getReply, saveMessageMysql } = require('./mysql')
const { saveMessageJson } = require('./jsonDb')
const { getDataIa } = require('./diaglogflow')
const  stepsReponse = require('../flow/response.json')
const { isUndefined } = require('util');
var ultimoStep; //MOD by CHV - 
var pasoRequerido; //MOD by CHV - 
var _vamosA = ""; //MOD by CHV - 
var VA = ""; //MOD by CHV - 
var elNum; //MOD by CHV - 
var cumplePasoPrevio = []; //MOD by CHV - 
const resps = require('../flow/response.json'); //MOD by CHV - Agregamos para traer las respuestas.
const { appendFile } = require('fs')

const getStepsInitial = () => {
    let contSI = 0
    let stepsInitial0 = []
    for (const resp in stepsReponse) {
       
        if(stepsReponse[resp]['keywords'] !== undefined){
            stepsInitial0[contSI]= {"keywords":stepsReponse[resp]['keywords'], "key":resp}
            contSI++
        }
    }
    return stepsInitial0
}
const stepsInitial = getStepsInitial()

const get = (message, num) => new Promise((resolve, reject) => { 
    
    elNum = num //MOD by CHV - 
    if(siguientePaso.find(k => k.numero.includes(elNum))){
        console.log("siguientePaso="+siguientePaso.find(k => k.numero.includes(elNum))["numero"], siguientePaso.find(k => k.numero.includes(elNum))["va"])        
        pasoAnterior[elNum] = siguientePaso.find(k => k.numero.includes(elNum))["va"] //
        siguientePaso.splice(siguientePaso.indexOf(elNum), 1)
        console.log("********************   "+siguientePaso.find(k => k.numero.includes(elNum)))
    }
    if(siguientePaso.length>1){console.log(siguientePaso[1]["numero"], siguientePaso[1]["va"])}

 
    if (process.env.DATABASE === 'none') {
       
        var logKeysArray = false  
        
        key = null
        let q = 0;
        if(logKeysArray) console.log(stepsInitial.length)
        while (key == null && q < stepsInitial.length) {
            if(Array.isArray(stepsInitial[q].keywords)){
                let r = 0
                let rFound = false
                while(!rFound && r<stepsInitial[q].keywords.length){
                    if(logKeysArray) console.log(q, "keyword=", stepsInitial[q].keywords[r], "msj=", message)
                    if(logKeysArray) console.log(q, "req=", resps[stepsInitial[q].key.toString()].pasoRequerido, "ant=", pasoAnterior[elNum])
                    if( message.toLowerCase() == stepsInitial[q].keywords[r].toLowerCase() && ( 
                            resps[stepsInitial[q].key.toString()].pasoRequerido == undefined ||
                            resps[stepsInitial[q].key.toString()].pasoRequerido == pasoAnterior[elNum]
                        )
                    ){
                        key = stepsInitial[q].key
                        if(logKeysArray) console.log(key, " SI COINCIDE")
                        rFound = true
                    }
                    else
                    {
                        // key = null
                        if(logKeysArray) console.log("No coincide")
                    }
                    r++
                }
            }
           q++
        }
        if(logKeysArray) console.log("KEY = ", key)
       
        var {keywords} = stepsInitial.find(k => k.key.includes(key)) || { keywords: null }
        if(!Array.isArray(keywords)){key=null;}
        if(key == null && message.length > 0){
           
            var logRegEx = false
           
            console.log("=======  KEY ES NULO, USAMOS REGEXP  =======");
            for (si=0; si<stepsInitial.length;si++){
                if(!Array.isArray(stepsInitial[si].keywords)){// Si "Keywords" NO es arreglo entonces ...
                    var coincideKeyword = null;
                    if(logRegEx) console.log("*** PASO=" + stepsInitial[si].key.toString() + " - REQUERIDO=" + resps[stepsInitial[si].key.toString()].pasoRequerido + " - ANTERIOR=" + pasoAnterior[elNum])
                    //Si NO hay paso requerido, o el paso requerido es IGUAL al paso anterior, entonces ...
                    if(resps[stepsInitial[si].key.toString()].pasoRequerido == undefined || resps[stepsInitial[si].key.toString()].pasoRequerido == pasoAnterior[elNum]){
                        var tempKeyword = "";
                        if(logRegEx) console.log(" - El paso requerido COINCIDE con el anterior, o NO hay paso requerido.")
                        if (stepsInitial[si].keywords == "%solo_correos%"){
                            if(logRegEx) console.log("solo_correos")
                            tempKeyword = "[a-zA-Z0-9]+[_a-zA-Z0-9\.-]*[a-zA-Z0-9]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+[\.][a-zA-Z]{2,12})"}
                        else { 
                            tempKeyword = stepsInitial[si].keywords.toString().replaceAll("*",".*")
                        }
                        coincideKeyword = message.match(tempKeyword); 
                        if (coincideKeyword != null){ 
                            if(logRegEx) console.log(" - - El mensaje COINCIDE con el keyword")
                            key = stepsInitial[si].key;
                         
                            if(resps[stepsInitial[si].key].pasoRequerido != null && resps[stepsInitial[si].key].pasoRequerido != pasoAnterior[elNum]){
                                key=null
                                if(logRegEx) console.log(" - - - Hay paso requerido y NO COINCIDE con en paso anterior")
                            }
                            if(resps[stepsInitial[si].key].replyMessage.toString().search("/URL") > -1){
                                if(logRegEx) console.log("****************    HAY URL    ****************")
                            }
                            break;
                        }
                        else {
                            coincideKeyword = null
                        }
                    }
                    else { 
                        if(logRegEx) console.log("--- NO CUMPLE PASO REQ");
                    }
                }
            }
            
        }
        const response = key || null
       
        if(resps[key]!=undefined){VA = resps[key].goto}else{VA=null}
        cumplePasoRequerido(key);
        _vamosA = VA;
        if(logRegEx) console.log("cumplePasoPrevio[elNum]=", cumplePasoPrevio[elNum], "_vamosA=", _vamosA)
        if(_vamosA != "" && _vamosA != undefined && cumplePasoPrevio[elNum] == true){
            if(logRegEx) console.log("ASIGNAMOS _VAMOSA = " + _vamosA);
            pasoAnterior[elNum] = _vamosA;
        }
        _vamosA = "";
        if(cumplePasoPrevio[elNum]) {resolve(response);}
    }

    if (process.env.DATABASE === 'mysql') {
        getData(message, (dt) => {
            resolve(dt)
        });
    }
})

const reply = (step) => new Promise((resolve, reject) => {

    if (process.env.DATABASE === 'none') {
        let resData = { replyMessage: '', media: null, trigger: null }
        const responseFind = stepsReponse[step] || {};
        resData = {
            ...resData, 
            ...responseFind
     
        }
        resolve(resData);
        return 
    }
 
    if (process.env.DATABASE === 'mysql') {
        let resData = { replyMessage: '', media: null, trigger: null }
        getReply(step, (dt) => {
            resData = { ...resData, ...dt }
            resolve(resData)
        });
    }
})

const getIA = (message) => new Promise((resolve, reject) => {

     if (process.env.DATABASE === 'dialogflow') {
        let resData = { replyMessage: '', media: null, trigger: null }
        getDataIa(message,(dt) => {
            resData = { ...resData, ...dt }
            resolve(resData)
        })
    }
})

/**
 * 
 * @param {*} message 
 * @param {*} date 
 * @param {*} trigger 
 * @param {*} number
 * @returns 
 */
const saveMessage = ( message, trigger, number, regla ) => new Promise( async (resolve, reject) => { 
     switch ( process.env.DATABASE ) {
         case 'mysql':
             resolve( await saveMessageMysql( message, trigger, number ) )
             break;
         case 'none':
             resolve( await saveMessageJson( message, trigger, number, regla) ) 
             break;
         default:
             resolve(true)
             break;
    }
})

module.exports = { get, reply, getIA, saveMessage, remplazos, stepsInitial, vamosA, traeUltimaVisita } 
/**
 * @param {elNum} string 
 * @param {elPaso} string -
 */
function vamosA (elNum, elPaso){
    pasoAnterior[elNum] = elPaso;
    console.log("Asignamos pasoAnterior con " + elPaso, elNum)
}


function remplazos(elTexto, extraInfo){
    if(elTexto == null){elTexto = '';}
    const fs = require('fs');
    laLista = elTexto.toString().split(' ');
    
        for (var i = 0; i < laLista.length; i++) {
          
            if (laLista[i].search('%dia_semana%')>-1){
                var dia = new Date().getDay();
                if(dia==0){diaSemana='domingo';}
                else if(dia==1){diaSemana='lunes';}
                else if(dia==2){diaSemana='martes';}
                else if(dia==3){diaSemana='miercoles';}
                else if(dia==4){diaSemana='jueves';}
                else if(dia==5){diaSemana='viernes';}
                else {diaSemana='sábado';}
                elTexto = elTexto.replace('%dia_semana%', diaSemana);
            }
            if (laLista[i].search('%saludo%')>-1){
                var hora = new Date().getHours()
                if(hora>0 && hora < 12){saludo='Buenos días';}
                else if(hora>11 && hora < 19){saludo='Buenas tardes';}
                else {saludo='Buenas noches';}
                elTexto = elTexto.toString().replace('%saludo%', saludo);
            }
            if (laLista[i].search('%hora24%')>-1){
                var hora = new Date().getHours();
                if (hora.toString().length < 2){hora = "0" + hora;}
                elTexto = elTexto.toString().replace('%hora24%', hora);
            }
            if (laLista[i].search('%hora12%')>-1){
                var hora = new Date().getHours();
                var ampm = hora >= 12 ? 'pm' : 'am';
                hora = hora % 12;
                hora = hora ? hora : 12; 
                if (hora.toString().length < 2){hora = "0" + hora;}
                elTexto = elTexto.toString().replace('%hora12%', hora);
            }
            if (laLista[i].search('%minutos%')>-1){
                var mins = new Date().getMinutes();
                if (mins.toString().length < 2){mins = "0" + mins;}
                elTexto = elTexto.toString().replace('%minutos%', mins);
            }
            if (laLista[i].search('%ampm%')>-1){
                var hours = new Date().getHours();
                var ampm = hours >= 12 ? 'pm' : 'am';
                elTexto = elTexto.toString().replace('%ampm%', ampm);
            }
            if (laLista[i].search('%rnd_')>-1){
                var inicio = laLista[i].search('%rnd_');
                var final = laLista[i].indexOf("%", inicio+1);
               
                var subStr = laLista[i].substring(inicio, final+1);
               
                var partes = subStr.toString().split('_');
                if(partes.length > 1){
                    var opciones = partes[1].toString().substring(0,partes[1].toString().length-1).split(",");
                    var elRand = Math.floor(Math.random() * (opciones.length));
                    if(elRand == opciones.length){elRand = elRand - 1;}
                    
                    elTexto = elTexto.toString().replace(subStr, opciones[elRand]);
                }
                else{
                    elTexto = elTexto.toString().replace(subStr, "");
                }
            }
            if(laLista[i].search('%msjant_')>-1){
                var histlMsjs = {};
               
                if(chkFile(`${__dirname}/../chats/`+elNum+".json")){
                    let rawdata = fs.readFileSync(`./chats/${elNum}.json`);
                    let elHistorial0 = JSON.parse(rawdata);
                    elHistorial = elHistorial0["messages"];
                    elHistorial = elHistorial.filter(x => x.message != "") 
                    var inicio = laLista[i].search('%msjant_');
                    var final = laLista[i].indexOf("%", inicio+1);
                    var subStr = laLista[i].substring(inicio, final+1);
                    var partes = subStr.toString().split('_');
                    if(partes.length > 1){
                       
                        let posicion0 = partes[1].substring(0, partes[1].length-1)
                        posicion = ((posicion0*1) + 1);
                        elTexto = elTexto.toString().replace(subStr, elHistorial[elHistorial.length - posicion]["message"].trim());
                    }
                   
                }
               
            }
            if (laLista[i].search('%body%')>-1){
                const {theMsg} = extraInfo;
                const { body } = theMsg
                elTexto = elTexto.toString().replace('%body%', body);
            }
            if (laLista[i].search('%from%')>-1){
                const {theMsg} = extraInfo;
                const { from } = theMsg
                elTexto = elTexto.toString().replace('%from%', from);
            }
            if (laLista[i].search('%solonumero%')>-1){
                const {theMsg} = extraInfo;
                const { from } = theMsg
                elTexto = elTexto.toString().replace('%solonumero%', from.replace('@c.us', ''));
            }
            if (laLista[i].search('%nombre%')>-1){
                if(typeof extraInfo !== undefined){
                    const {theMsg} = extraInfo;
                    if(theMsg['_data']['notifyName'] !== undefined){
                        elTexto = elTexto.toString().replace('%nombre%', theMsg['_data']['notifyName']);
                    }
                }
            }
            if (laLista[i].search('%primer_nombre%')>-1){
                if(typeof extraInfo !== undefined){
                    const {theMsg} = extraInfo;
                    if(theMsg['_data']['notifyName'] !== undefined){
                        elTexto = elTexto.toString().replace('%primer_nombre%', theMsg['_data']['notifyName'].split(' ')[0]);
                    }
                }
            }
      }
  
      return elTexto.trim()
 }


 function cumplePasoRequerido(step){
   
    if(resps[step]!=undefined){pasoRequerido=resps[step].pasoRequerido}else{pasoRequerido=null}
    if((pasoRequerido != null && pasoRequerido == ultimoStep)){
       
        cumplePasoPrevio[elNum] = true;
    }
    else if((pasoRequerido != null && pasoRequerido != pasoAnterior[elNum])){
        
        cumplePasoPrevio[elNum] = false;
    }
    else{
      
        cumplePasoPrevio[elNum] = true;
    }
    pasoAnterior[elNum] = step
}   

/**
 * @param {*} theFile 
 * @returns 
 */
function chkFile(theFile){ 
    const fs = require('fs');
    if (fs.existsSync(theFile)) {
      
        var h = true;
    }
    else{
        
        var h = false;
    }
    return h;
}

/**
 * @param {*} file 
 * @param {*} datepart
 */
function traeUltimaVisita(file, datepart = 'n'){

    let thisLog = false
    const fs = require('fs');
    let theFile = `${__dirname}/../chats/`+file+".json"
    if(thisLog) console.log("chkFile=", chkFile(theFile), datepart)
    if(chkFile(theFile)){
        
        const fd = fs.openSync(theFile);
       
        if(thisLog) console.log(new Date())
        prevStats = fs.statSync(theFile);
       
        if(thisLog) console.log("Modification Time:", prevStats.mtime);
        if(thisLog) console.log("Access Time:", prevStats.atime);
   
        let changedModifiedTime = new Date();
        let changedAccessTime = new Date();
        // Use the futimes() function to assign
        // the new timestamps to the file descriptor
        fs.futimes(fd, changedAccessTime, changedModifiedTime, ()=>{})
        if(thisLog) console.log("dd=", dateDiff(datepart, prevStats.atime, changedAccessTime))
        if(thisLog) console.log(new Date())
        return dateDiff(datepart, prevStats.atime, changedAccessTime)
    }
    else { return 0 }
}
 /**
 * Regresa el tiempo transcurrido en (datepart) entre las fechas dadas.
 * datepart: 'y', 'm', 'w', 'd', 'h', 'n', 's'
 * @param {*} datepart 
 * @param {*} fromdate 
 * @param {*} todate 
 * @returns 
 */
function dateDiff(datepart, fromdate, todate){
    datepart = datepart.toLowerCase();	
    var diff = todate - fromdate;	
    var divideBy = { w:604800000, 
                        d:86400000, 
                        h:3600000, 
                        n:60000, 
                        s:1000 };	
    
    return Math.floor( diff/divideBy[datepart]);
}