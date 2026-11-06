import { ServiceContext } from '@vtex/api'
import axios from 'axios'
import { Clients } from '../clients'

interface FileUploadStream {
  filename: string
  mimetype: string
  encoding: string
  createReadStream: () => NodeJS.ReadableStream
}

interface ContactFormInput {
  name: string
  email: string
  subject: string
  message: string
  recaptchaToken: string
  attachment?: Promise<FileUploadStream>
}

const RECAPTCHA_SECRET = '6LcmTA4uAAAAAGFmoWY8-S48aOLJ9bEQuHn7Xs4K'
const DATA_ENTITY = 'CQ'

export const submitContactForm = async (
  _: unknown,
  { input }: { input: ContactFormInput },
  ctx: ServiceContext<Clients>
) => {
  const { name, email, subject, message, recaptchaToken, attachment } = input
  const {
    clients: { masterdata },
    vtex: { account, authToken },
  } = ctx

  // 1. Validate Google reCAPTCHA v3
  try {
    const params = new URLSearchParams()
    params.append('secret', RECAPTCHA_SECRET)
    params.append('response', recaptchaToken)

    const recaptchaRes = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    if (!recaptchaRes.data?.success) {
      const errorCodes = recaptchaRes.data?.['error-codes'] || []
      return {
        success: false,
        id: null,
        message: `Bot verification failed: ${errorCodes.join(', ') || 'Invalid token'}`,
      }
    }

    // Score verification (0.0 is bot, 1.0 is human)
    if (typeof recaptchaRes.data?.score === 'number' && recaptchaRes.data.score < 0.3) {
      return {
        success: false,
        id: null,
        message: 'Bot verification score too low. Please try again.',
      }
    }
  } catch (err) {
    const error = err as any
    return {
      success: false,
      id: null,
      message: error?.response?.data || 'reCAPTCHA verification service error.',
    }
  }

  // 2. Resolve File Attachment Metadata
  let attachmentName = ''
  if (attachment) {
    try {
      const resolvedFile = await attachment
      attachmentName = resolvedFile.filename
    } catch (fileErr) {
      console.error('Failed to parse uploaded attachment:', fileErr)
    }
  }

  // 3. Save to Master Data (CQ Entity)
  let documentId = ''
  try {
    const createDocRes = await masterdata.createDocument({
      dataEntity: DATA_ENTITY,
      fields: {
        name,
        email,
        subject,
        message,
        attachmentName,
      },
    })

    documentId = createDocRes.DocumentId
  } catch (err) {
    const error = err as any
    return {
      success: false,
      id: null,
      message:
        error?.response?.data?.Message ||
        error?.message ||
        'Failed to save contact information in Master Data.',
    }
  }

  // 4. Send Email Notification via VTEX Message Center
  try {
    const mailResponse = await axios.post(
      `https://${account}.vtexcommercestable.com.br/api/mail-service/pvt/sendmail`,
      {
        templateName: 'contact-us-notification',
        jsonData: {
          name,
          email,
          subject,
          message,
          attachmentName: attachmentName || 'None',
          documentId,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'VtexIdclientAutcookie': authToken,
        },
      }
    )

    console.log('--- MESSAGE CENTER SUCCESS ---', mailResponse.status, mailResponse.data)
  } catch (emailErr) {
    const err = emailErr as any
    console.error(
      'Message Center email trigger failed:',
      err?.response?.status,
      err?.response?.data || err?.message
    )
  }

  return {
    success: true,
    id: documentId,
    message: 'Your message has been sent successfully.',
  }
}