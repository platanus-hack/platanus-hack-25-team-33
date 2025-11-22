import styled from "@emotion/styled"
import { Button, PrimaryButton } from "../ui/Button"
import { Menu, MenuItem } from "../ui/Menu"
import { useGenerateNotes } from "../../actions/generation"

const Container = styled.div`
  display: flex;
  gap: 1em;
`

export const GenerativeAIMenu = () => {
  const { generateNotes } = useGenerateNotes()
  return (
    <Container>
      <PrimaryButton onClick={generateNotes}>
        Generate notes
      </PrimaryButton>
    </Container>
  )
}
