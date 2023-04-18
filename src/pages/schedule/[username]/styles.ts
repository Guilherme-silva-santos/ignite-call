import { Heading, Text, styled } from '@ignite-ui/react'

export const Container = styled('div', {
  maxWidth: 852,
  padding: '0 $4',
  margin: '$20 auto $4',
})

export const UserHeader = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  // para fazera estilização apenas do heading que esta dentro do userHeader
  [` > ${Heading} `]: {
    lineHeight: '$base', // para controlar o espaçamento das linha do texto
    margin: '$2',
  },

  [` > ${Text} `]: {
    color: '$gray200',
  },
})
