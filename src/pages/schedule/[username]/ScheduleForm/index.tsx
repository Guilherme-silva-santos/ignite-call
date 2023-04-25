import { useState } from 'react'
import { CalendarStep } from './CalandarStep'
import { ConfirmStep } from './ConfirmStep'

/**
 * para que seja possivel fazer um if se deve exibir o calendarstep ou se deve ser exibido o confirmstep
 */

export function ScheduleForm() {
  // cria um state que armazenara o date ou nada
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>()

  function handleClearSelectedDateTime() {
    setSelectedDateTime(null)
  }

  if (selectedDateTime) {
    // se a data for selecionada retorna para a apagina de confirmação
    return (
      <ConfirmStep
        schedulingDate={selectedDateTime}
        // foi passado para o botão cancel no confirmStep um onclick com a prop onCancelConfirmation
        // então aqui so passou a pagina para onde ele sera redirecionado
        onCancelConfirmation={handleClearSelectedDateTime}
      />
    )
  }
  return <CalendarStep onSelectDateTime={setSelectedDateTime} />
}
