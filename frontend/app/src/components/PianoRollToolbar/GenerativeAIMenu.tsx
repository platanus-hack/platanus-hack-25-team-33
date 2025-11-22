import styled from "@emotion/styled"
import { PrimaryButton } from "../ui/Button"
import { useGenerateNotes } from "../../actions/generation"
import { useInstrumentBrowser } from "../../hooks/useInstrumentBrowser"
import { InstrumentName } from "../TrackList/InstrumentName"
import ReactDOMServer from 'react-dom/server';

const Container = styled.div`
  display: flex;
  gap: 1em;
`

export const GenerativeAIMenu = () => {
  const { generateNotes, isLoading } = useGenerateNotes()
  const { setting } = useInstrumentBrowser()

  const selectedInstrumentName = ReactDOMServer.renderToString(
    <InstrumentName {...setting} />
  );

  return (
    <Container>
      <PrimaryButton onClick={() => generateNotes(selectedInstrumentName)}>
        {isLoading ? 'Generando...' : 'Generar notas'}
      </PrimaryButton>
    </Container>
  )
}
