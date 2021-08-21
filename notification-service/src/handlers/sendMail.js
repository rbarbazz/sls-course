import AWS from 'aws-sdk'

const ses = new AWS.SES({ region: 'ca-central-1' })

async function sendMail(event, context) {
  const record = event.Records[0]
  const email = JSON.parse(record.body)
  const { subject, body, recipient } = email

  const params = {
    Destination: { ToAddresses: [recipient] },
    Source: '', // Has to be a verified email when using sandbox mode
    Message: {
      Body: {
        Text: {
          Data: body,
        },
      },
      Subject: {
        Data: subject,
      },
    },
  }

  try {
    const result = await ses.sendEmail(params).promise()
    console.log(result)
    return result
  } catch (error) {
    console.error(error)
  }
}

export const handler = sendMail
