import styled from "@emotion/styled"
import { FC, useEffect, useState } from "react"
import { useAddTrack } from "../../actions"
import { Dialog, DialogContent, DialogTitle, DialogActions } from "../../components/Dialog/Dialog"
import { Button, PrimaryButton } from "../ui/Button"
import { Select } from "../ui/Select"
import { useGenerateAccompaniment } from "../../actions/generation"
import { usePianoRoll } from "../../hooks/usePianoRoll"
import { notesToTokens } from "../../utils/tokens"
import { isNoteEvent } from "@signal-app/core"

const Wrapper = styled.div`
  display: flex;
  padding: 0.5rem 1rem;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  border-radius: 0.5rem;
  margin: 0.5rem;
  cursor: pointer;

  &:hover {
    background: var(--color-highlight);
  }
`

const Label = styled.div`
  font-size: 0.875rem;
  margin-bottom: .25em;
`

const Input = styled.input`
  width: 100%;
  display: flex;
  border: none;
  border-radius: 0.2rem;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  outline: none;
`

const INSTRUMENTS = ['Piano', 'Bass', 'Strings', 'Drums', 'Choir', 'Synth']

export const GenerateTrackButton: FC = () => {
  const { selectedTrack } = usePianoRoll()
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [instrument, setInstrument] = useState('Piano')

  const {
    isLoading,
    generateAccompaniment
  } = useGenerateAccompaniment({
    onSuccess: () => {
      setOpen(false)
    },
  })

  const notes = selectedTrack?.events.filter(isNoteEvent) || []
  const tokens = notesToTokens(notes)

  console.log({ tokens })

  return (
    <div>
      <Wrapper>
        <Label onClick={() => setOpen(true)}>
          Generate track
        </Label>
      </Wrapper>

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogTitle>
          Generar track
        </DialogTitle>
        <DialogContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5em', width: '400px' }}>
            <div style={{ marginBottom: '1em'}}>
              <Label>Prompt</Label>
              <Input disabled={isLoading} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            </div>

            <div>
              <Label>Instrument</Label>
              <Select value={instrument} disabled={isLoading} onChange={(e) => {
                setInstrument(e.target.value)
              }}>
                {INSTRUMENTS.map((instrument) => (
                  <option value={instrument}>{instrument}</option>
                ))}
              </Select>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <PrimaryButton onClick={() => generateAccompaniment(prompt, tokens || '', instrument)} disabled={isLoading}>
            {isLoading ? 'Generando...' : 'Generar'}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}
