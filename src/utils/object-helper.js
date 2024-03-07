const _ = require('lodash');

/**
 * get Filed value by column id
 * @param {Object} columnValue 
 * @param {String} columnId 
 * @returns 
 */
const getFiledValue=(columnValue,columnId)=>{
    if(columnId === "status"){
        return {
            "label": _.get(columnValue,'label.text',""),
            "index": Number(_.get(columnValue,'label.index',""))
        };
    } else if(columnId === "email"){
        return _.get(columnValue,'email',"")
    } else if(columnId === "numbers"){
        return _.get(columnValue,'value',0)
    }
}

module.exports = {
    getFiledValue
}