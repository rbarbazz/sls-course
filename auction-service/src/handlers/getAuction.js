import AWS from 'aws-sdk'
import createError from 'http-errors'

import commonMiddleware from '../lib/commonMiddleware'

const dynamobdb = new AWS.DynamoDB.DocumentClient()

export async function getAuctionById(id) {
  let auction

  try {
    const result = await dynamobdb
      .get({ Key: { id }, TableName: process.env.AUCTIONS_TABLE_NAME })
      .promise()

    auction = result.Item
  } catch (error) {
    console.error(error)

    throw new createError.InternalServerError(error)
  }

  if (!auction) {
    throw new createError.NotFound(`Auction with ID"${id}" not found`)
  }

  return auction
}

async function getAuction(event, context) {
  const { id } = event.pathParameters
  let auction = await getAuctionById(id)

  return {
    body: JSON.stringify(auction),
    statusCode: 200,
  }
}

export const handler = commonMiddleware(getAuction)
