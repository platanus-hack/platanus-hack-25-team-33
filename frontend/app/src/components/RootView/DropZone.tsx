import styled from "@emotion/styled"
import { FC, PropsWithChildren, useCallback } from "react"
import { tracksFromFile } from "../../actions/file"
import { useHistory } from "../../hooks/useHistory"
import { useSong } from "../../hooks/useSong"
import { useLocalization } from "../../localize/useLocalization"

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
`

export const DropZone: FC<PropsWithChildren> = ({ children }) => {
  const { isSaved, addTrack } = useSong()
  const localized = useLocalization()
  const { pushHistory } = useHistory()

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file.type !== "audio/midi" && file.type !== "audio/mid") {
        return
      }
      if (isSaved || confirm(localized["confirm-open"])) {
        const tracks = await tracksFromFile(file)

        if (tracks.length === 0) {
          alert("No tracks found in the MIDI file.")
          return
        }

        pushHistory()
        tracks.forEach((track) => {
          addTrack(track)
        })
      }
    },
    [isSaved, addTrack, pushHistory, localized],
  )

  return (
    <Container onDrop={onDrop} onDragOver={onDragOver}>
      {children}
    </Container>
  )
}
