import { Service, ParamsContext, RecorderState, method } from '@vtex/api'
import { Clients } from './clients'
import { getContactUsApi } from './middleware/getContactUsApi'
import { getContacts } from './resolvers/contacts'
import { submitContactForm } from './resolvers/submitContactForm'

export default new Service<Clients, RecorderState, ParamsContext>({
  clients: {
    implementation: Clients,
    options: {
      default: {
        retries: 2,
        timeout: 10000,
      },
    },
  },
  routes: {
    getContactUs: method({
      GET: [getContactUsApi],
    }),
  },
  graphql: {
    resolvers: {
      Query: {
        getContacts,
      },
      Mutation: {
      submitContactForm,
    },
    },
  },
})