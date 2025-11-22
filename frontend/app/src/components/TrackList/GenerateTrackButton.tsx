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
import { InstrumentName } from "./InstrumentName"

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

const INSTRUMENTS = [
  { number: 0, name: "Acoustic Grand Piano" },
  { number: 1, name: "Bright Acoustic Piano" },
  { number: 2, name: "Electric Grand Piano" },
  { number: 3, name: "Honky-tonk Piano" },
  { number: 4, name: "Electric Piano 1" },
  { number: 5, name: "Electric Piano 2" },
  { number: 6, name: "Harpsichord" },
  { number: 7, name: "Clavinet" },
  { number: 8, name: "Celesta" },
  { number: 9, name: "Glockenspiel" },
  { number: 10, name: "Music Box" },
  { number: 11, name: "Vibraphone" },
  { number: 12, name: "Marimba" },
  { number: 13, name: "Xylophone" },
  { number: 14, name: "Tubular Bells" },
  { number: 15, name: "Dulcimer" },
  { number: 16, name: "Drawbar Organ" },
  { number: 17, name: "Percussive Organ" },
  { number: 18, name: "Rock Organ" },
  { number: 19, name: "Church Organ" },
  { number: 20, name: "Reed Organ" },
  { number: 21, name: "Accordion" },
  { number: 22, name: "Harmonica" },
  { number: 23, name: "Tango Accordion" },
  { number: 24, name: "Acoustic Guitar (nylon)" },
  { number: 25, name: "Acoustic Guitar (steel)" },
  { number: 26, name: "Electric Guitar (jazz)" },
  { number: 27, name: "Electric Guitar (clean)" },
  { number: 28, name: "Electric Guitar (muted)" },
  { number: 29, name: "Overdriven Guitar" },
  { number: 30, name: "Distortion Guitar" },
  { number: 31, name: "Guitar Harmonics" },
  { number: 32, name: "Acoustic Bass" },
  { number: 33, name: "Electric Bass (finger)" },
  { number: 34, name: "Electric Bass (pick)" },
  { number: 35, name: "Fretless Bass" },
  { number: 36, name: "Slap Bass 1" },
  { number: 37, name: "Slap Bass 2" },
  { number: 38, name: "Synth Bass 1" },
  { number: 39, name: "Synth Bass 2" },
  { number: 40, name: "Violin" },
  { number: 41, name: "Viola" },
  { number: 42, name: "Cello" },
  { number: 43, name: "Contrabass" },
  { number: 44, name: "Tremolo Strings" },
  { number: 45, name: "Pizzicato Strings" },
  { number: 46, name: "Orchestral Harp" },
  { number: 47, name: "Timpani" },
  { number: 48, name: "String Ensemble 1" },
  { number: 49, name: "String Ensemble 2" },
  { number: 50, name: "Synth Strings 1" },
  { number: 51, name: "Synth Strings 2" },
  { number: 52, name: "Choir Aahs" },
  { number: 53, name: "Voice Oohs" },
  { number: 54, name: "Synth Choir" },
  { number: 55, name: "Orchestra Hit" },
  { number: 56, name: "Trumpet" },
  { number: 57, name: "Trombone" },
  { number: 58, name: "Tuba" },
  { number: 59, name: "Muted Trumpet" },
  { number: 60, name: "French Horn" },
  { number: 61, name: "Brass Section" },
  { number: 62, name: "Synth Brass 1" },
  { number: 63, name: "Synth Brass 2" },
  { number: 64, name: "Soprano Sax" },
  { number: 65, name: "Alto Sax" },
  { number: 66, name: "Tenor Sax" },
  { number: 67, name: "Baritone Sax" },
  { number: 68, name: "Oboe" },
  { number: 69, name: "English Horn" },
  { number: 70, name: "Bassoon" },
  { number: 71, name: "Clarinet" },
  { number: 72, name: "Piccolo" },
  { number: 73, name: "Flute" },
  { number: 74, name: "Recorder" },
  { number: 75, name: "Pan Flute" },
  { number: 76, name: "Blown Bottle" },
  { number: 77, name: "Shakuhachi" },
  { number: 78, name: "Whistle" },
  { number: 79, name: "Ocarina" },
];

export const GenerateTrackButton: FC = () => {
  const { selectedTrack } = usePianoRoll()
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [instrumentName, setInstrumentName] = useState('Piano')
  const [instrument, setInstrument] = useState(0)

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
                setInstrument(parseInt(e.target.value))
                setInstrumentName(INSTRUMENTS.find((instrument) => instrument.number === parseInt(e.target.value))?.name ?? '')
              }}>
                {INSTRUMENTS.map((instrument) => (
                  <option value={instrument.number.toString()}>
                    {instrument.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <PrimaryButton onClick={() => generateAccompaniment(prompt, tokens || '', instrumentName, instrument)} disabled={isLoading}>
            {isLoading ? 'Generando...' : 'Generar'}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}
