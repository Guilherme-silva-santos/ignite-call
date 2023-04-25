import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { prisma } from '../../../../lib/prisma'
import dayjs from 'dayjs'
import { google } from 'googleapis'
import { getGoogleOAuthToken } from '@/src/lib/google'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const username = String(req.query.username)

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return res.status(400).json({ message: 'User does not exist.' })
  }

  const createSchedulingBody = z.object({
    name: z.string(),
    email: z.string().email(),
    observations: z.string(),
    date: z.string().datetime(),
  })

  const { name, email, observations, date } = createSchedulingBody.parse(
    req.body, // req.body usa o body para pegar todas as informações de dentro do fomulario
  )

  const schedulingDate = dayjs(date).startOf('hour')
  // para que a hora sempre esteja no começo da hora nunca esteja quebrada

  if (schedulingDate.isBefore(new Date())) {
    // verificando se a data não passou
    return res.status(400).json({
      message: 'Date is in the past',
    })
  }

  const conflictingScheduling = await prisma.scheduling.findFirst({
    // verificando se não há outro agendamento nessa mesam hora
    where: {
      user_id: user.id,
      date: schedulingDate.toDate(),
    },
  })
  if (conflictingScheduling) {
    return res.status(400).json({
      message: 'There is another acheduling in the same time.',
    })
  }

  const scheduling = await prisma.scheduling.create({
    data: {
      name,
      email,
      observations,
      date: schedulingDate.toDate(),
      user_id: user.id,
    },
  })

  const calendar = google.calendar({
    version: 'v3',
    auth: await getGoogleOAuthToken(user.id),
  })

  await calendar.events.insert({
    calendarId: 'primary', // pega o calendario default para a criação de eventos do user ou seje o googlecalendar
    conferenceDataVersion: 1, //
    requestBody: {
      // precisa ter todas as informações do evento em si
      summary: `Ignite Call: ${name}`, // titulo do evento, e o nome do user que pediu a agenda
      description: observations,
      start: {
        dateTime: schedulingDate.format(),
      },
      end: {
        dateTime: schedulingDate.add(1, 'hour').format(),
      },
      attendees: [
        // quem participara do evento
        { email, displayName: name },
      ],
      conferenceData: {
        // para que o evento seja criado com o google meet
        createRequest: {
          requestId: scheduling.id,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    },
  })

  return res.status(201).end
}
