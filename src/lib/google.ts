import { google } from 'googleapis'
import { prisma } from './prisma'
import dayjs from 'dayjs'

export async function getGoogleOAuthToken(userId: string) {
  /** para quando for feita a comunicação com a api do google access
   * ela vai bater no banco de dados ver se o access token expirou ou não
   * e então vai atualizar ou não as informações com o refresh token
   */
  const account = await prisma.account.findFirstOrThrow({
    /**
     * procura o registro na tabela account onde o userId for o que esta sendo recebido no parametro
     * e o provider for o google
     */
    where: {
      provider: 'google',
      user_id: userId,
    },
  })

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )

  auth.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : null,
  })

  if (!account.expires_at) {
    return auth
  }

  const isTokenExpired = dayjs(account.expires_at * 1000).isBefore(new Date())

  /**
   * pois o tempo de expiração é em segundos e o dayjs precisa dele em milisegundos
   * e verifica se a data de expiração do token é anterior a data atual
   * e se o token for expirado pega o auth e coloca o refreshAccessToken
   */

  if (isTokenExpired) {
    const { credentials } = await auth.refreshAccessToken()
    const {
      access_token,
      expiry_date,
      id_token,
      refresh_token,
      scope,
      token_type,
    } = credentials

    await prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        access_token,
        expires_at: expiry_date ? Math.floor(expiry_date / 1000) : null,
        // para que ele seja salvo no banco em segundos
        id_token,
        refresh_token,
        scope,
        token_type,
      },
    })
    auth.setCredentials({
      access_token,
      refresh_token,
      expiry_date,
    })
  }

  return auth
}
