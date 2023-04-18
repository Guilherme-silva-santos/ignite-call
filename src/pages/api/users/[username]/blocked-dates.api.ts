// import dayjs from 'dayjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'

/**
 * Rota que retorna as datas bloqueadas no calendario como por exemplo nos dias em que o user não ira trabalhar
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end()
    // se o metodo for diferente de get, dara um erro 405, pois esssa é uma rota que busca alguma informação
  }

  const username = String(req.query.username)
  /**
   * o query retorna tanto os dados enviado como parametro na rota, como é este caso que o parametro
   * esta na pasta que foi colocado o arquivo, quanto os dados enviados em querryparams como por exemplo
   * http://localhost:3333?username
   */
  const { year, month } = req.query
  /**
   * o query pega as infomações na url passando o month e o year
   * http://localhost:3000/api/users/guilhermejn/blocked-dates?year=2023&month=10
   */

  if (!year || !month) {
    return res.status(400).json({ message: 'Year or month not specified.' })
  }

  const user = await prisma.user.findUnique({
    // fazendo a busca do user no banco de dados para ver se o usuario realmente esta cadastrado
    where: {
      username,
    },
  })

  if (!user) {
    // caso o user não exista
    return res.status(400).json({ message: 'User does not exist.' })
  }

  /**
   * Variavel pra procurar os dias da semana que o usuario tem disponibilidade
   * Pois é preciso bloquear os dias que o user não tem disponivel na sua agenda
   *
   * findMany = achar todos
   *
   * Retorna um array com todos os dias da semana em que o user tem disponibilidade
   */
  const availableWeekDays = await prisma.userTimeInterval.findMany({
    select: {
      week_day: true,
    },
    where: {
      user_id: user.id,
    },
  })

  /**
   * Quais são dos dias da semana que eu quero que fiquem bloqueados, que são todos os dias da semana
   * tirando os que ele tem disponibilidade availableWeekDays
   *
   * filtra os dias da semana com weekday [0, 1, 2, 3, 4, 5, 6].filter((weekDay)
   *
   * retorna os dias que não tem no availableWeekDays
   */
  const blockedWeekDays = [0, 1, 2, 3, 4, 5, 6].filter((weekDay) => {
    return !availableWeekDays.some(
      (availableWeekDay) => availableWeekDay.week_day === weekDay,
    )
  })

  /**
   * query para retornar os dias que estaão com os horarios cheios
   * Precisa pegar cada dia da semana e ver quais os horarios que estão disponiveis
   * e quais agendamentos tem em um determinado dia da semana e retornar se ainda tem algum horario disponivel
   * Exemplo:
   * SEG - [8, 9, 10] - [8, 9] => true ainda tem um horario disponivel
   * SEG - [8, 9, 10] - [8, 9, 10] => false não tem um horario disponivel
   *
   * queryRaw são para querys mais brutas querys maiores e querys sql direto pro banco
   * porem elas não funcionam com sqlite então é preciso migrar pra o mysql por isso vamos usar o docker
   *
   * O que é o deocker ?
   * Docker é um subSistema que ira rodar dentro da maquina
   *
   * comando para rodar o mysqlp no docker
   * docker run --name mysql -e MYSQL_ROOT_PASSWORD=docker -p 3306:3306 mysql:latest
   * da o nome pro banco, no caso será mysql, -e variavel ambeinte com o nome MYSQL_ROOT_PASSWORD=docker
   * e trocando a seha do root em desenvolvimento para docker
   * -p disponibilizando a porta do mysql 2206 ou seja expondo a porta
   */
  const blockedDatesRaw = await prisma.$queryRaw`
  /**
    começa buscando todos os scheduligs do user disponiveis naquele mes 
   */
    SELECT *
    FROM schedulings S

    WHERE S.user_id = ${user.id}
    /**
        schedulings que o mes e o ano da data bate com o mes e o ano da data em que esta sendo feita a busca 
        DATE_FORMAT é um formato do sql para formatar datas 
        então pega o S = schedulings.date e formata a data '%Y-%m' assim retornando o mes e o ano da seguinte 
        maneira 2023-10 e verifica se eles são iguais ao year e month 
     */
        AND DATE_FORMAT(S.date, '%Y-%m') = ${`${year}-${month}`}

`

  return res.json({ blockedWeekDays, blockedDatesRaw })
}
