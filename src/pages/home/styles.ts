import { styled, Heading, Text } from '@ignite-ui/react'

export const Container = styled('div', {
  maxWidth: 'calc(100vw - (100vw - 1160px) / 2)',
  /**
   * calc(100vw o tamanho da tela - (100vw - 1160px) o taanho todo menos o 1160 que é o tamnaho do container
   * e com isso sobrara um espaço a esquerda que é o que queremos, minha tela menos o conteudo, e divide por dois
   * pois queremos a margem apenas na esquerda
   * centraliza a aplicação porem se o tamanho da tela for menor que a soma dos dois elemento
   * a imagem vai perdendo espaço
   */
  marginLeft: 'auto',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  gap: '$20',
})

export const Hero = styled('div', {
  maxWidth: 480,
  padding: '0 $10',

  [` > ${Heading}`]: {
    '@media(max-width: 600px)': {
      fontSize: '$6xl',
    },
  },

  // o sinal de > serve para que essa estilização seja feita apenas neste componente

  [` > ${Text}`]: {
    maskType: '$2',
    color: '$gray200',
  },
})

export const Preview = styled('div', {
  paddingRight: '$8',
  overflow: 'hidden',

  '@media(max-width: 600px)': {
    // quando a tela chegar nesse tamanho e imagem desaparecera
    display: 'none',
  },
})
