import styled from "@emotion/styled"
import { FC, useState } from "react"
import { useAddTrack } from "../../actions"
import { Dialog, DialogContent, DialogTitle, DialogActions } from "../../components/Dialog/Dialog"
import { Button, PrimaryButton } from "../ui/Button"

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
`

export const GenerateTrackButton: FC = () => {
  const addTrack = useAddTrack()
  const [open, setOpen] = useState(false)

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
          Hola
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <PrimaryButton>
            Generar
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}
