import { NextApiRequest, NextApiResponse, NextPageContext } from 'next'
import { Adapter } from 'next-auth/adapters'
import { parseCookies, destroyCookie } from 'nookies'
import { prisma } from '../prisma'

/**
 * os adapter servem para armazenar informaçãoes de autenticações por providers dentro
do banco de dados.
Os adapter provem vários métodos para criar dados dentro do banco de dados, como 
por exemplo no creta user são métodos que foram passados para que um user fosse
criado, como no caso desta aplicação o user foi criado antes da autenticação 
ele precisou buscar o id do user dentro dos cookies para ver ser este user 
realmente foi criado e então fazer a conexão do user com sua conta do google
 */

export function PrismaAdapter(
  // ao apssar o req e res para a função prisma adapter
  // faz com que ela tenha acesso a ambos que estavam dentro do arquivo [...nextauth]
  req: NextApiRequest | NextPageContext['req'],
  res: NextApiResponse | NextPageContext['res'],
): Adapter {
  return {
    async createUser(user) {
      /**
       * Neste compenente vai buscar o id do user no cookies, pois na página register ele o user já pré setou o seu user
       * nome de ususário, e quando fizer a conexão com o calendar precisa manter essa mesma conexão
       * com base no id dos cookies é preciso preencher as demais informações que vem do objeto user, como email, nome avatar
       * mas isso dentro do registro do banco de dados que já existe
       *
       * Mas só é possivel ter acessoa ao cookies de dentro do req e do res
       * dentro do req temos todos os cookies
       * e do res é possivel criar ou deleletar os cookies
       *
       * parsecookies é para buscar todos os cookies passando o req para ele
       *
       * ai na const faz um desestruturação do @ignitecall:userId e o nome que será da var userIdOnCookies
       */
      const { '@ignite-call:userId': userIdOnCookies } = parseCookies({ req })

      if (!userIdOnCookies) {
        throw new Error('User ID not found on cookies')
      }

      const prismaUser = await prisma.user.update({
        // se houver o user fara o update das informações do provider para dentro da conta do user
        where: {
          id: userIdOnCookies,
        },
        data: {
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
        },
      })
      destroyCookie({ res }, '@ignite-call:userId', {
        // depois que o user fez login como não precisaremos mais dos cookies eles podem ser destruidos
        // e foi usado o res pois sempre que for modificar os cookies usa-se o res
        path: '/',
      })
      return {
        id: prismaUser.id,
        name: prismaUser.name,
        username: prismaUser.username,
        email: prismaUser.email!,
        emailVerified: null,
        avatar_url: prismaUser.avatar_url!,
      }
    },

    async getUser(id) {
      const user = await prisma.user.findUnique({
        // prisma para ter acesso ao prisma e pagando o user
        // o findunique para encotra um usuario com um id unico
        // por isso foi usado o where id
        where: {
          id,
        },
      })

      if (!user) {
        // caso não tenha user retona nulo
        return null
      }

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email!,
        emailVerified: null,
        avatar_url: user.avatar_url!,
      }
    },
    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!user) {
        return null
      }

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email!,
        emailVerified: null,
        avatar_url: user.avatar_url!,
      }
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const account = await prisma.account.findUnique({
        where: {
          provider_provider_account_id: {
            // pois no banco de dados foi criado um provider_account_id podemos usar o provder antes
            // para quer seja buscado o provider com que esse user foi criado, então podemos procurar
            // pela soma desses dois campos
            provider,
            provider_account_id: providerAccountId,
          },
        },
        include: {
          user: true,
        },
      })

      if (!account) {
        return null
      }

      const { user } = account
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email!,
        emailVerified: null,
        avatar_url: user.avatar_url!,
      }
    },

    async updateUser(user) {
      const prismaUser = await prisma.user.update({
        // para fazer o update do user depois que ele for logado com o provider
        // neste caso os dados que serão atualizados quando isso for feito são
        // name, email, avatar_url
        where: {
          id: user.id!,
        },
        data: {
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
        },
      })

      return {
        id: prismaUser.id,
        name: prismaUser.name,
        username: prismaUser.username,
        email: prismaUser.email!,
        emailVerified: null,
        avatar_url: prismaUser.avatar_url!,
      }
    },

    async linkAccount(account) {
      // quando o usuario loga com outro provider
      // por exemplo ele tinha uma conta com o google e loga nesta memsa conta com o github
      // então o prisma cria uma nova account, com todos os data do user
      await prisma.account.create({
        data: {
          user_id: account.userId,
          type: account.type,
          provider: account.provider,
          provider_account_id: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
      })
    },

    async createSession({ sessionToken, userId, expires }) {
      // quando a sessão do user foi iniciada o tempo que ela ira durar
      await prisma.session.create({
        data: {
          user_id: userId,
          expires,
          session_token: sessionToken,
        },
      })
      return {
        userId,
        sessionToken,
        expires,
      }
    },

    async getSessionAndUser(sessionToken) {
      const PrismaSession = await prisma.session.findUnique({
        where: {
          session_token: sessionToken,
        },
        include: {
          user: true,
        },
      })

      if (!PrismaSession) {
        return null
      }

      const { user, ...session } = PrismaSession

      return {
        session: {
          userId: session.user_id,
          expires: session.expires,
          sessionToken: session.session_token,
        },
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email!,
          emailVerified: null,
          avatar_url: user.avatar_url!,
        },
      }
    },

    async updateSession({ sessionToken, userId, expires }) {
      // para quando o user fizer outra sessão o quais dados serão atualizados
      const prismaSession = await prisma.session.update({
        where: {
          session_token: sessionToken,
        },
        data: {
          expires,
          user_id: userId,
        },
      })

      return {
        sessionToken: prismaSession.session_token,
        userId: prismaSession.user_id,
        expires: prismaSession.expires,
      }
    },

    async deleteSession(sessionToken) {
      await prisma.session.delete({
        where: {
          session_token: sessionToken,
        },
      })
    },

    // async createVerificationToken({ identifier, expires, token }) {},

    // async useVerificationToken({ identifier, token }) {},
  }
}
