import AWS from 'aws-sdk'
import createError from 'http-errors'
import validator from '@middy/validator'

import commonMiddleware from '../lib/commonMiddleware'
import getAuctionsSchema from '../lib/schemas/getAuctionsSchema'

const dynamobdb = new AWS.DynamoDB.DocumentClient()

async function getAuctions(event, context) {
  let auctions
  const { status } = event.queryStringParameters
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeValues: { ':status': status },
    ExpressionAttributeNames: { '#status': 'status' },
  }

  try {
    const result = await dynamobdb.query(params).promise()

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

export const handler = commonMiddleware(getAuctions).use(
  validator({ inputSchema: getAuctionsSchema, useDefaults: true }),
)
