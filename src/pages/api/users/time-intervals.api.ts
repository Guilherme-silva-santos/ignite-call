import { prisma } from '../../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { buildNextAuthOptions } from '../auth/[...nextauth].api'
/**
 * será responsavel por receber o formulario, da págimna time intervals e salvar essas informações dentro
   dos registros do user
 */

const timeIntervalsBodySchema = z.object({
  intervals: z.array(
    z.object({
      weekDay: z.number(),
      startTimeInMinutes: z.number(),
      endTimeInMinutes: z.number(),
    }),
  ),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).end()
    // como essa rota será usada para cadastrar os intervalos de tempo que user tem disponibilidade
    // dará um erro caso o metetodo for diferente de post
  }
  // para obter informações do user logado no serverside com o next auth usa-se o metodo de dentro da doc chamdo de
  // unstable_getServerSession()
  const session = await getServerSession(
    req,
    res,
    buildNextAuthOptions(req, res),
  )

  if (!session) {
    return res.status(401).end()
    // se a sessaõ não for encontrada retorna o erro 401, de não autenticado
  }

  const { intervals } = timeIntervalsBodySchema.parse(req.body)
  // o perse serve para que busque ja dentro do timeIntervalsBodySchemao objeto já tipado
  // e com ele não é necessario fazer qualquer tipo de validação pois, caso o objeto venha de ummjeito diferente
  // do timeIntervalsBodySchema ele já retorna um erro

  await Promise.all(
    intervals.map((interval) => {
      return prisma.userTimeInterval.create({
        data: {
          week_day: interval.weekDay,
          time_start_in_minutes: interval.startTimeInMinutes,
          time_end_in_minutes: interval.endTimeInMinutes,
          user_id: session.user?.id,
        },
      })
    }),
  )
  return res.status(201).end()
}
