import AWS from 'aws-sdk'

const dynamobdb = new AWS.DynamoDB.DocumentClient()

export async function setAuctionPictureUrl(id, pictureUrl) {
  const params = {
    Key: { id },
    TableName: process.env.AUCTIONS_TABLE_NAME,
    UpdateExpression: 'set pictureUrl = :pictureUrl',
    ExpressionAttributeValues: { ':pictureUrl': pictureUrl },
    ReturnValues: 'ALL_NEW',
  }
  const result = await dynamobdb.update(params).promise()

  return result.Attributes
}
