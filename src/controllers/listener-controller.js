const { manageDuplicatesValue } = require('../services/manage-duplicates-service');
const { createItemHistoryONLocal } = require('../services/manage-item-service');
/**
 * Listen for the column value change and check if the new updated value is duplicated
 * @param {Request} req 
 * @param {Response} res 
 * @returns Response with status 200
 */
async function columnValueChangeListener (req, res) {
    try {
        const { boardId, itemId , columnId , groupId, columnValue } = req.body.payload.inboundFieldValues;

        await manageDuplicatesValue(boardId, itemId , columnId , groupId, columnValue);

        return res.status(200).send("DONE");
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'internal server error' });
    }
}

async function newItemCreateListener (req, res) {
    try {
        const { boardId, itemId , groupId } = req.body.payload.inboundFieldValues;

        await createItemHistoryONLocal({
            boardID:boardId,
            groupID:groupId,
            itemID:itemId,
            action_status:"New Item"
        });

        return res.status(200).send("DONE");
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'internal server error' });
    }
}

module.exports = {
    columnValueChangeListener,
    newItemCreateListener
};
