import React, { useState, useEffect } from 'react'
import { useMutation } from 'react-apollo'
import { useCssHandles } from 'vtex.css-handles'
import { Input, Button, Alert } from 'vtex.styleguide'
import SUBMIT_CONTACT from '../../Graphql/submitContact.gql'

declare global {
  interface Window {
    grecaptcha: any
  }
}

const CSS_HANDLES = [
  'contactUs__container',
  'contactUs__title',
  'contactUs__form',
  'contactUs__form-group',
  'contactUs__label',
  'contactUs__textarea',
  'contactUs__file-input',
  'contactUs__submit-btn',
] as const

const RECAPTCHA_SITE_KEY = '6LcmTA4uAAAAAGElySFpjTCENodXuM3FwjquRaEp'

const ContactUsForm: React.FC = () => {
  const handles = useCssHandles(CSS_HANDLES)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const [submitContact, { loading }] = useMutation(SUBMIT_CONTACT)

  useEffect(() => {
    const scriptId = 'google-recaptcha-v3-script'
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (validTypes.indexOf(selected.type) === -1) {
        setNotification({
          type: 'error',
          text: 'Only .jpg, .png, and .pdf files are allowed.',
        })
        return
      }
      setFile(selected)
    }
  }

  const getRecaptchaToken = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha) {
        reject(new Error('reCAPTCHA script failed to load. Please refresh the page.'))
        return
      }

      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, {
            action: 'contact_submit',
          })
          resolve(token)
        } catch (err) {
          reject(err)
        }
      })
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNotification(null)

    try {
      const recaptchaToken = await getRecaptchaToken()

      const res = await submitContact({
        variables: {
          input: {
            name,
            email,
            subject,
            message,
            recaptchaToken,
            attachment: file,
          },
        },
      })

      if (res?.data?.submitContactForm?.success) {
        setNotification({
          type: 'success',
          text: res.data.submitContactForm.message,
        })
        setName('')
        setEmail('')
        setSubject('')
        setMessage('')
        setFile(null)
      } else {
        setNotification({
          type: 'error',
          text: res?.data?.submitContactForm?.message || 'Submission failed.',
        })
      }
    } catch (err) {
      const error = err as any
      setNotification({
        type: 'error',
        text: error?.message || 'Error sending contact request.',
      })
    }
  }

  return (
    <div className={`mw6 center pv6 ph4 ${handles['contactUs__container']}`}>
      <h2 className={`t-heading-2 mb5 ${handles['contactUs__title']}`}>Contact Us</h2>

      {notification && (
        <div className="mb5">
          <Alert type={notification.type}>{notification.text}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className={handles['contactUs__form']}>
        <div className={`mb4 ${handles['contactUs__form-group']}`}>
          <Input
            label="Name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
          />
        </div>

        <div className={`mb4 ${handles['contactUs__form-group']}`}>
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={`mb4 ${handles['contactUs__form-group']}`}>
          <Input
            label="Subject"
            value={subject}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
            required
          />
        </div>

        <div className={`mb4 ${handles['contactUs__form-group']}`}>
          <label
            htmlFor="message-details"
            className={`db t-small mb2 c-on-base ${handles['contactUs__label']}`}
          >
            Message / Comments
          </label>
          <textarea
            id="message-details"
            name="message"
            className={`w-100 b--solid b--muted-4 bw1 br2 pa3 outline-0 c-on-base bg-base ${handles['contactUs__textarea']}`}
            maxLength={1000}
            rows={5}
            value={message}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
            required
          />
        </div>

        <div className={`mb5 ${handles['contactUs__form-group']}`}>
          <label className={`db t-small mb2 c-on-base ${handles['contactUs__label']}`}>
            Attachment (.jpg, .png, .pdf)
          </label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            className={`db w-100 ${handles['contactUs__file-input']}`}
          />
        </div>

        <div className={handles['contactUs__submit-btn']}>
          <Button type="submit" isLoading={loading} block>
            Send Message
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ContactUsForm