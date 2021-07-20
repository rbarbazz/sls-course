import AWS from 'aws-sdk'
import createError from 'http-errors'

import commonMiddleware from '../lib/commonMiddleware'

const dynamobdb = new AWS.DynamoDB.DocumentClient()

async function getAuctions(event, context) {
  let auctions

  try {
    const result = await dynamobdb
      .scan({ TableName: process.env.AUCTIONS_TABLE_NAME })
      .promise()

    auctions = result.Items
  } catch (error) {
    console.error(error)

    throw new createError.InternalServerError(error)
  }

  return {
    body: JSON.stringify(auctions),
    statusCode: 200,
  }
}

export const handler = commonMiddleware(getAuctions)
