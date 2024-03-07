const _ = require('lodash');
const triggerAPI = require('../utils/trigger-API');

/**
 * get the item details by item id
 * @param {Number} id 
 * @returns 
 */
const getItemDataBYID = async (id) => {
    const query = `
        query {
            items(ids: ${id}) {
                name
                group {
                    id
                    title
                }
                column_values {
                    id
                    value
                    type
                    text
                    column {
                    title
                    }
                }
            }
        }
    `;
    const result = await triggerAPI(query);
    return {
        itemID: id,
        itemName: _.get(result,'items.0.name',""),
        items:_.get(result,'items.0.column_values',[])
    }
}

/**
 * remove the item by id
 * @param {Number} id 
 * @returns 
 */
const removeItemBYID = async (id) => {
    try{
        const query = `
            mutation {
                delete_item (item_id: ${id}) {
                id
                }
            }
        `;
        await triggerAPI(query);
        return true;
    } catch (ex){
        console.log('ex',ex);
        return false;
    }
}

/**
 * update the email address by item id and board id
 * @param {Number} itemID 
 * @param {Number} boardID 
 * @param {String} emailAddress 
 * @returns 
 */
const updateEmail = async (itemID,boardID,emailAddress) => {
    const emailBody = {
        "email" : {
            "email":emailAddress,
            "text":emailAddress
        }
    }

    const query = `
      mutation {
        change_multiple_column_values (item_id:${itemID}, board_id:${boardID}, column_values: "${JSON.stringify(emailBody).replace(/"/g, '\\"')}") {
          id
        }
      }
    `;
    const result = await triggerAPI(query);
    return result;
}

/**
 * create new item record
 * @param {String} groupID 
 * @param {Number} boardID 
 * @param {String} itemName 
 * @param {String} emailAddress 
 * @param {Object} body 
 * @returns 
 */
const createItemRecord = async (groupID,boardID,itemName,emailAddress,body) => {
    console.log('groupID',groupID,boardID,itemName,emailAddress,body);
    const query = `
        mutation {
            create_item (board_id: ${boardID}, group_id: "${groupID}", item_name: "${itemName}", column_values: "${JSON.stringify(body).replace(/"/g, '\\"')}") {
                id
            }
        }
    `;
    const result = await triggerAPI(query);
    const newItemID = _.get(result,'create_item.id',"");
    updateEmail(newItemID,boardID,emailAddress);
    return newItemID;
}


module.exports = {
    getItemDataBYID,
    createItemRecord,
    removeItemBYID,
};
