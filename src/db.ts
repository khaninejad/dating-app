import { DynamoDB } from 'aws-sdk';

// Create a new DynamoDB service object
const dynamodb = new DynamoDB({ region: 'us-east-1' });

// Set the parameters for the table
const params = {
  TableName: 'SWIPE_TABLE4',
  KeySchema: [
    { AttributeName: 'user_id', KeyType: 'HASH' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'user_id', AttributeType: 'S' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  },
  GlobalSecondaryIndexes: [
    {
      IndexName: 'ProfileIndex',
      KeySchema: [
        { AttributeName: 'user_id', KeyType: 'HASH' }
      ],
      Projection: { ProjectionType: 'ALL' },
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    }
  ],
};

dynamodb.createTable(params, function(err, data) {
  if (err) {
    console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
  } else {
    console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
  }
});