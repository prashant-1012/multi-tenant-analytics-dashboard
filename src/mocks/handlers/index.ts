import { analyticsHandlers } from './analytics'
import { usersHandlers } from './users'
import { tenantsHandlers } from './tenants'
import { reportsHandlers } from './reports'

export const handlers = [
  ...analyticsHandlers,
  ...usersHandlers,
  ...tenantsHandlers,
  ...reportsHandlers,
]
