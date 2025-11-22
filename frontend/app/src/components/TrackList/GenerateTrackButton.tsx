import styled from "@emotion/styled"
import Add from "mdi-react/AddIcon"
import { FC } from "react"
import { useAddTrack } from "../../actions"
import { Localized } from "../../localize/useLocalization"

const Wrapper = styled.div`
  display: flex;
  padding: 0.5rem 1rem;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  border-radius: 0.5rem;
  margin: 0.5rem;

  &:hover {
    background: var(--color-highlight);
  }
`

const Label = styled.div`
  font-size: 0.875rem;
`

export const GenerateTrackButton: FC = () => {
  const addTrack = useAddTrack()

  return (
    <Wrapper>
      <Label>
        Generate track
      </Label>
    </Wrapper>
  )
}
