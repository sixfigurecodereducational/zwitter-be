import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';


const dynamodb = new AWS.DynamoDB.DocumentClient();
const databaseName = process.env.DYNAMO_TABLE_NAME;

export async function createZweet(content, createdBy) {
    const id = uuidv4();

    const zweet = {
        id : id,
        content: content,
        createdBy : createdBy,
        createdOn: new Date().toISOString()
    };

    const params = {
        TableName: databaseName,
        Item: zweet
    };

    try {
        await dynamodb.put(params).promise();

    } catch(err) {
        console.error(err);
        throw new Error('Error creating zweet');
    }
}

export async function getZweetsByUser(userID) {
    const params = {
        TableName: databaseName,
        FilterExpression: 'createdBy = :userID',
        ExpressionAttributeValues: {
            ':userID': userID
        }
    };

    try {
        const result = await dynamodb.scan(params).promise();
        return result.Items;

    } catch(err) {
        console.error(err);
        throw new Error('Error grabbing zweets by user');
    }
}

export async function getAllZweets() {
    const params = {
        TableName: databaseName
    };

    try {
        const result = await dynamodb.scan(params).promise();
        return result.Items;

    } catch(err) {
        console.error(err);
        throw new Error('Error grabbing all zweets');
    }
}

export async function deleteZweet(id, createdBy) {
    const params = {
        TableName: databaseName,
        Key: { id },
        ConditionExpression: 'createdBy = :createdBy',
        ExpressionAttributeValues: {
            ':createdBy': createdBy
        }
    };
    try {
        await dynamodb.delete(params).promise();

    } catch (err) {
        console.error(err);
        throw new Error('Error deleting zweet');
    }
}