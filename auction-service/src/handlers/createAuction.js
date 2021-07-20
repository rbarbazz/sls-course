import { v4 as uuid } from 'uuid'
import AWS from 'aws-sdk'
import createError from 'http-errors'

import commonMiddleware from '../lib/commonMiddleware'

const dynamobdb = new AWS.DynamoDB.DocumentClient()

async function createAuction(event, context) {
  const { title } = event.body
  const now = new Date()
  const auction = {
    id: uuid(),
    highestBid: {
      amount: 0,
    },
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
  }

  try {
    await dynamobdb
      .put({ TableName: process.env.AUCTIONS_TABLE_NAME, Item: auction })
      .promise()
  } catch (error) {
    console.error(error)

    throw new createError.InternalServerError(error)
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  }
}

export const handler = commonMiddleware(createAuction)
