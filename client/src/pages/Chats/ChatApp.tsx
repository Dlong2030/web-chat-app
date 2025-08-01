import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useSocket } from '../../hooks/useSocket'
import { Button } from '../../components/ui/Button'

const ChatApp = () => {
  const { connected, error, reconnecting } = useSelector((state: any) => state.socket);
  const { socketService } = useSocket();

  if (socketService.isConnected) {
    console.log('Socket is connected');
  } else {
    console.log('Socket is not connected');
  }

  return (
    <div>
      aloalo
      <Button onClick={() => socketService.createConversation({
        type: 'direct',
        participantIds: ['684fa424cb6767c7256a1739'],
        name: 'New Conversation',
      })}>
        Send Message
      </Button>
      <Button onClick={() => socketService.sendMessage({
        conversationId: '688c8d3a1768bb59a3d98896',
        content: 'Hello, world!',
        type: 'text',
      })}>
      Send
    </Button>
    </div >
  )
}

export default ChatApp
