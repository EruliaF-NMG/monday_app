const _ = require('lodash');

/**
 * find email address in items
 * @param {Object} items 
 * @returns 
 */
const findEmailAddressInItems=(items)=>{
    try {
        const emailObject = JSON.parse(_.get(_.find(items,{"id": "email"}),'value',""));
        return _.get(emailObject,'email',null);
    } catch (ex){
        console.log('ex',ex);
        return null;
    }
}

/**
 * loop items and return the object
 * @param {*} items 
 * @param {*} isRealState 
 * @returns 
 */
const loopItems=(items,isRealState=false)=>{
    try {
        const dateObject = JSON.parse(_.get(_.find(items,{"id": "date4"}),'value',""));
        return {
            "person":null,
            "status":isRealState?String(JSON.parse(_.get(_.find(items,{"id": "status"}),'value',"")).index):"3",
            "date4": _.get(dateObject,'date',null),
            "numbers":JSON.parse(_.get(_.find(items,{"id": "numbers"}),'value',""))
        }
    } catch (ex){
        console.log('ex',ex);
        return null;
    }
}

/**
 * get the full object of the item
 * @param {Object} items 
 * @returns 
 */
const getItemFullObject=(items)=>{
    try {
        const dateObject = JSON.parse(_.get(_.find(items,{"id": "date4"}),'value',""));
        return {
            "email":findEmailAddressInItems(items),
            "person":null,
            "date4": _.get(dateObject,'date',null),
            "numbers":JSON.parse(_.get(_.find(items,{"id": "numbers"}),'value',"")),
            "status":_.get(JSON.parse(_.get(_.find(items,{"id": "status"}),'value',"")),'index',''),
        }
    } catch (ex){
        console.log('ex',ex);
        return null;
    }
}



module.exports = {
    findEmailAddressInItems,
    loopItems,
    getItemFullObject
}