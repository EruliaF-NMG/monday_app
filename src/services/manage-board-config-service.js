const triggerAPI = require('../utils/trigger-API');
const _ = require('lodash');
const BoardConfigModel = require('../models/board-group-config.model');
const { duplicateGroupName } = require('../config/core.config');

/**
 * get the group details of the board
 * @param {Number} boardId 
 * @returns 
 */
const getGroupDetails = async (boardId) => {
    const query = `
        query {
            boards(ids: ${boardId}) {
            id
            name
            groups {
                id
                title
            }
            }
        }
    `;
    const boardsData = await triggerAPI(query);
    return _.get(boardsData,'boards',[]);
}

/**
 * create a duplicate table on monday board
 * @param {Number} boardId 
 * @returns 
 */
const createDuplicateTableONMonday = async (boardId) => {
    const query = `
      mutation {
        create_group(
          board_id: ${boardId},
          group_name: "${duplicateGroupName}",
        ) {
          id
        }
      }
    `;
    const boardsData = await triggerAPI(query);
    return _.get(boardsData,'create_group.id',null);
}

/**
 * Create a duplicate table and register the board config to local DB
 * @param {Array} boardsList 
 * @param {Number} boardId 
 * @returns 
 */
const createDuplicateTableANDregisterBoardConfigToLocal = async (boardsList=[], boardId) => {
    try {
        // create a duplicate table on monday.com
        const duplicateTableID = await createDuplicateTableONMonday(boardId);
        const groupRef = boardsList[0].groups.map(group => {
            return {
                groupID: group.id,
                isDuplicate: false
            }
        });

        groupRef.push({
            groupID: duplicateTableID,
            isDuplicate: true
        })
        // insert to local DB
        const data = await BoardConfigModel.create({
            boardID: boardId,
            groupRef: groupRef
        });
        return data;
    } catch (error){
        console.error('Error in createDuplicateTableANDregisterBoardConfigToLocal',error);
        return {};
    }
}

/**
 * get the local configs from the local DB
 * @param {Number} boardId 
 * @returns 
 */
const getLocalConfigs = async (boardId) => {
    try{
        const data = await BoardConfigModel.findOne({ boardID: boardId });
        return data;
    }catch(ex){
        console.log("Error in getLocalConfigs")
        return {};
    }
}


/**
 * sync the local configs with the monday board and return the local configs
 * @param {Number} boardId 
 * @param {String} groupId 
 * @returns 
 */
const registerANDgetLocalConfigs = async (boardId,groupId) => {
   let localConfigs = {};
   const boardsList = await getGroupDetails(boardId);
   // if the board has only one table and it is not a duplicate table then create a duplicate table and register the board config to local DB
   if(boardsList[0].groups.length === 1 && _.filter(boardsList[0].groups, { title: duplicateGroupName }).length === 0 ) localConfigs = await createDuplicateTableANDregisterBoardConfigToLocal(boardsList,boardId);
   // If the borad allrady having duplicate and main table
   else if (boardsList[0].groups.length === 2 && _.filter(boardsList[0].groups, { title: duplicateGroupName }).length === 1 ) localConfigs = await getLocalConfigs(boardId);
   return {
    boardID : _.get(localConfigs,'boardID',null),
    mainGroupID : _.get(_.find(localConfigs.groupRef, { 'isDuplicate': false }),'groupID',null),
    duplicateGroupID :  _.get(_.find(localConfigs.groupRef, { 'isDuplicate': true }),'groupID',null),
   }
};
  

module.exports = {
    registerANDgetLocalConfigs,
}