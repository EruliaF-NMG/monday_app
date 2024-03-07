
const apiEndpoint = "https://api.monday.com/v2";
const apiToken = process.env.AUTH_TOKEN;

const keyColumnFields = [ "status", "email", "numbers" ];

const duplicateGroupName = "Duplicate";

module.exports = {
    keyColumnFields,
    apiEndpoint,
    apiToken,
    duplicateGroupName
}