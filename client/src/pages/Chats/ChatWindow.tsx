import React from 'react'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useSelector } from 'react-redux'
import { useSocket } from '../../hooks/useSocket'

const ChatWindow = () => {
  const { connected, error, reconnecting } = useSelector((state: any) => state.socket);
  const { socketService } = useSocket();

  if (socketService.isConnected) {
    console.log('Socket is connected');
  } else {
    console.log('Socket is not connected');
  }

  return (
    <div>
      
    </div>
  )
}

export default ChatWindow
