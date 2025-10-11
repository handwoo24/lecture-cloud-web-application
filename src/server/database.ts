import { createServerFn } from '@tanstack/react-start'
import { getVersion } from '@/database/version'

export const getVersionFn = createServerFn({ method: 'GET' }).handler(
  getVersion,
)
