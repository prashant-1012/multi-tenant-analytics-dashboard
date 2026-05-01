import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Singleton browser worker — imported by MSWProvider
export const worker = setupWorker(...handlers)
