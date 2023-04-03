import { globalCss } from '@ignite-ui/react'

export const globalStyles = globalCss({
  // configurações do css global da aplicação
  '*': {
    boxSizing: 'border-box',
    padding: 0,
    margin: 0,
  },

  body: {
    backgroundColor: '$gray900',
    color: '$gray100',
    '-webkit-font-smoothing': 'antialiased',
    // para que em navegadores que usem webkit a fonte fique mais detalhada
  },
})
