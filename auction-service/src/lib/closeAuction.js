import AWS from 'aws-sdk'

const dynamobdb = new AWS.DynamoDB.DocumentClient()
const sqs = new AWS.SQS()

export async function closeAuction(auction) {
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id: auction.id },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeValues: { ':status': 'CLOSED' },
    ExpressionAttributeNames: { '#status': 'status' },
  }

  await dynamobdb.update(params).promise()

  const { title, seller, highestBid } = auction
  const { amount, bidder } = highestBid
  const hasBid = amount > 0
  const sellerMessageBody = hasBid
    ? `Your item ${title} has been sold for $${amount}.`
    : `Your auction for item ${title} has not received any bid.`

  // Notify seller
  await sqs
    .sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: `Your item has ${hasBid ? '' : 'not '}been sold`,
        recipient: seller,
        body: sellerMessageBody,
      }),
    })
    .promise()

  if (!hasBid) return

  // Notify bidder
  await sqs
    .sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: 'You won an auction',
        recipient: bidder,
        body: `You got yourself a ${title} for $${amount}`,
      }),
    })
    .promise()

  return
}
