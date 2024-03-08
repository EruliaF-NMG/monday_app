const _ = require('lodash');
const async = require('async');
const {getFiledValue} = require('../utils/object-helper');
const { createItemRecord,removeItemBYID } = require('./manage-item-service')

const { registerANDgetLocalConfigs } = require('./manage-board-config-service');
const { keyColumnFields } = require('../config/core.config');
const triggerAPI = require('../utils/trigger-API');
const { getItemDataBYID } = require('./manage-item-service'); 
const { findEmailAddressInItems, loopItems, getItemFullObject } = require('../utils/array-helper');
const { createItemHistoryONLocal } = require('./manage-item-service');

/**
 * Check if the value is duplicated by column and group
 * @param {Number} boardId 
 * @param {Number} columnId 
 * @param {String} groupId 
 * @param {any} value 
 * @param {Boolean} isZeroRecode 
 * @returns 
 */
const valueIsduplicateByColumnANDGroup = async (boardId,columnId, groupId,value="",isZeroRecode=false) => {
    const param = columnId!=="status" ? `"${value}"` : value.index;
    const query = `
        {
            boards(ids: ${boardId}) {
                groups(ids: "${groupId}") {
                    items_page(query_params: {rules: [{column_id: "${columnId}", compare_value:[${param}]}]}) {
                        cursor
                        items{
                            id
                            name
                        }
                    }
                }
            }
        }
    `;
    const result = await triggerAPI(query);
    const itmes  = _.get(result,'boards.0.groups.0.items_page.items',[]);
    if(isZeroRecode) return itmes.length === 0 ? false : true;
    return itmes.length > 1 ? true : false;
}

/**
 * check if the item is duplicated
 * @param {Number} boardId 
 * @param {String} groupId 
 * @param {Object} itemObject 
 * @param {Boolean} isZeroRecode 
 * @returns 
 */
const checkItemIsDuplicate =  (boardId, groupId,itemObject,isZeroRecode=false) => {
    return new Promise((resolve, reject) => {
        async.parallel([
            (emailCallback) => {
                valueIsduplicateByColumnANDGroup(boardId,"email", groupId,itemObject.email,isZeroRecode).then((result)=>{
                    emailCallback(null, result);
                }).catch((err)=>{
                    emailCallback(err, null);
                });
            },
            (statusCallback)=>{
                if(itemObject.status == 3) return statusCallback(null, true)
                valueIsduplicateByColumnANDGroup(boardId,"status", groupId,{index:itemObject.status},isZeroRecode).then((result)=>{
                    statusCallback(null, result);
                }).catch((err)=>{
                    statusCallback(err, null);
                });
            },
            (numberCallback)=>{
                valueIsduplicateByColumnANDGroup(boardId,"numbers", groupId,itemObject.numbers,isZeroRecode).then((result)=>{
                    numberCallback(null, result);
                }).catch((err)=>{
                    numberCallback(err, null);
                });
            }
        ], (err, results) => {
            if(err) reject(err);
            resolve(results.every(v => v === false)? false : true);
        });
    });
}

/**
 * Check chanched value is duplicated with another existing fields and if it is duplicated then move the item to duplicate group
 * @param {Number} boardId 
 * @param {Number} itemId 
 * @param {String} columnId 
 * @param {String} groupId 
 * @param {Object} columnValue 
 * @returns 
 */
const manageDuplicatesValue = async (boardId, itemId , columnId , groupId, columnValue) => {
  // check if the column belongs to one of the following types: status, email, or numbers
  if(!keyColumnFields.includes(columnId)) return; 
  // sync monday.com board & group id with local DB
  const localConfigs =  await registerANDgetLocalConfigs(boardId);
  //  get Filed value by column id
  const filedValue = getFiledValue(columnValue,columnId);
  // exit prosess if board id is null
  if(localConfigs.boardID===null) return;
  // get item data by item id
  const itemData = await getItemDataBYID(itemId); 

  // set item value change to local history 
  if(String(localConfigs.mainGroupID) === String(groupId))  await createItemHistoryONLocal({
        boardID:boardId,
        groupID:groupId,
        itemID:itemId,
        action_status:"Updated",
        update_column:columnId,
        update_value:columnId!=="status" ? filedValue : filedValue.index
    });

  // check if the change is happend in main table and the value is duplicated
  if(String(localConfigs.mainGroupID) === String(groupId) && await valueIsduplicateByColumnANDGroup(boardId,columnId, groupId,filedValue)) {
    // create a new item in the duplicate group    
    await createItemRecord(localConfigs.duplicateGroupID,boardId,itemData.itemName,findEmailAddressInItems(itemData.items),loopItems(itemData.items))
    // remove the item from the main group
    await removeItemBYID(itemId);
    // set item value change to local history 
    await createItemHistoryONLocal({
        boardID:boardId,
        groupID:groupId,
        itemID:itemID,
        action_status:"Removed",
        deleted_at: new Date()
    });
  }
  //  exit prosess if the change is happend in duplicate table and the status is Duplicate
  else if(String(localConfigs.duplicateGroupID) === String(groupId) && columnId === "status" && filedValue.index === 3) return;
  // check if the change is happend in duplicate table and the value is not duplicated
  else if(String(localConfigs.duplicateGroupID) === String(groupId) && !await checkItemIsDuplicate(boardId, localConfigs.mainGroupID,getItemFullObject(itemData.items),true)) {
    // create a new item in the main group
    const itemID= await createItemRecord(localConfigs.mainGroupID,boardId,itemData.itemName,findEmailAddressInItems(itemData.items),loopItems(itemData.items,true))
    
    // set item value change to local history 
    await createItemHistoryONLocal({
        boardID:boardId,
        groupID:localConfigs.mainGroupID,
        itemID:itemID,
        action_status:"New Item",
    });
    
    // remove the item from the duplicate group
    await removeItemBYID(itemId);
  }
}

module.exports = {
    manageDuplicatesValue
};
