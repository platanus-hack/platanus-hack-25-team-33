import styled from "@emotion/styled"
import { Button, PrimaryButton } from "../ui/Button"
import { Menu, MenuItem } from "../ui/Menu"

const Container = styled.div`
  display: flex;
  gap: 1em;
`

export const GenerativeAIMenu = () => {
  return (
    <Container>
      <PrimaryButton>
        Generate notes
      </PrimaryButton>
    </Container>
  )
}
