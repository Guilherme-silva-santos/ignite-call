// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { setCookie } from 'nookies'
import { prisma } from '../../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    // se for diferente de post precisa dar um erro pois a rota não pode ser executada em um metodo diferente de post
    return res.status(405).end()
  }

  const { name, username } = req.body

  const userExists = await prisma.user.findUnique({
    // findunic é para procurar no banco de dados se ja foi criado um usuario com username igual
    // pois o user recebeu uma cheve unic
    where: {
      username,
    },
  })

  if (userExists) {
    return res.status(400).json({ message: 'Username already taken.' })
  }

  const user = await prisma.user.create({
    data: {
      // quais dados vão ser utilizados para criar o usuario
      name,
      username,
    },
  })

  setCookie({ res }, '@ignitecall:userId', user.id, {
    // primeiro parametro a resposta, segundo, o nome do cookie
    // terceiro o que sera usado para validação, e abaixo as opções dos cookies
    maxAge: 60 * 60 * 24 * 7, // 7 dias para expiração
    path: '/', // passando o / todas as rotas da aplicação terão acesso a este cookies
    // esse userid dentro do cookie vai servir para identificar qual user esta fazendo o login
  })

  return res.status(201).json(user)
}
