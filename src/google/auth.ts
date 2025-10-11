import { createServerOnlyFn } from '@tanstack/react-start'
import { OAuth2Client } from 'google-auth-library'
import type { Credentials } from 'google-auth-library'

let oauthClient: OAuth2Client | null = null

export const getOAuthClient = createServerOnlyFn(() => {
  if (!oauthClient) {
    return (oauthClient = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    }))
  }

  return oauthClient
})

export const generateAuthUrl = createServerOnlyFn((client: OAuth2Client) => {
  return client.generateAuthUrl({
    access_type: 'online',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
    ],
  })
})

export const verifyTokens = (client: OAuth2Client, tokens: Credentials) => {
  if (!tokens.id_token) {
    throw new Error('Invalid ID Token')
  }

  return client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  })
}
