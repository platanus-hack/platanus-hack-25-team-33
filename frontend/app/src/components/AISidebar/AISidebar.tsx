import styled from "@emotion/styled"
import { FC, useEffect, useRef, useState } from "react"
import { usePianoRoll } from "../../hooks/usePianoRoll"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
  background: var(--color-background);
  border-left: 1px solid var(--color-divider);
  height: 100%;
  flex-shrink: 0;
`

const Header = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--color-divider);
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--color-text);
`

const MessageList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const MessageItem = styled.div<{ isUser: boolean }>`
  align-self: ${props => props.isUser ? "flex-end" : "flex-start"};
  background: ${props => props.isUser ? "var(--color-theme)" : "var(--color-background-secondary)"};
  color: ${props => props.isUser ? "white" : "var(--color-text)"};
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  max-width: 80%;
  word-break: break-word;
  font-size: 0.9rem;
`

interface Message {
  id: string
  text: string
  isUser: boolean
}

export const AISidebar: FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { aiExplanation, setAiExplanation } = usePianoRoll()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (aiExplanation) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: aiExplanation,
          isUser: false
        }
      ])
      setAiExplanation("")
    }
  }, [aiExplanation, setAiExplanation])

  return (
    <Container>
      <Header>AI Assistant</Header>
      <MessageList>
        {messages.map(msg => (
          <MessageItem key={msg.id} isUser={msg.isUser}>
            {msg.text}
          </MessageItem>
        ))}
        <div ref={messagesEndRef} />
      </MessageList>
    </Container>
  )
}
