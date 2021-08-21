import AWS from 'aws-sdk'
import createError from 'http-errors'
import validator from '@middy/validator'

import { getAuctionById } from './getAuction'
import commonMiddleware from '../lib/commonMiddleware'
import placeBidSchema from '../lib/schemas/placeBidSchema'

const dynamobdb = new AWS.DynamoDB.DocumentClient()

async function placeBid(event, context) {
  const { id } = event.pathParameters
  const { amount } = event.body
  const { email } = event.requestContext.authorizer

  let auction = await getAuctionById(id)

  if (auction.status != 'OPEN') {
    throw new createError.Forbidden('You cannot bid on closed auctions.')
  }

  if (email === auction.seller) {
    throw new createError.Forbidden(`You can't bid on your own auction`)
  }

  if (email === auction.highestBid.bider) {
    throw new createError.Forbidden(`You can't double bid`)
  }

  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(
      `Your bid must be higher than ${auction.highestBid.amount}`,
    )
  }

  const params = {
    Key: { id },
    TableName: process.env.AUCTIONS_TABLE_NAME,
    UpdateExpression:
      'set highestBid.amount = :amount, highestBid.bider = :bider',
    ExpressionAttributeValues: { ':amount': amount, ':bider': email },
    ReturnValues: 'ALL_NEW',
  }
  let updatedAuction

  try {
    const result = await dynamobdb.update(params).promise()

    updatedAuction = result.Attributes
  } catch (error) {
    console.error(error)

    throw new createError.InternalServerError(error)
  }

  return {
    body: JSON.stringify(updatedAuction),
    statusCode: 200,
  }
}

export const handler = commonMiddleware(placeBid).use(
  validator({ inputSchema: placeBidSchema }),
)
