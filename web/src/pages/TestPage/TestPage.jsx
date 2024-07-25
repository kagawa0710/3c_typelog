import { useState, useEffect, useRef } from 'react'

import { Button, Box, Typography } from '@mui/material'
import { styled } from '@mui/system'

import { Metadata } from '@redwoodjs/web'

const StyledTextArea = styled('textarea')(({ theme }) => ({
  width: '90%',
  margin: '10px auto',
  display: 'block',
  padding: '10px',
  fontSize: '16px',
  borderRadius: '4px',
  border: `1px solid ${theme.palette.grey}`,
  // boxShadow: theme.shadows[1],
  resize: 'none',
}))

const TestPage = () => {
  const [inputLog, setInputLog] = useState([])
  const [startTime, setStartTime] = useState(null)
  const [timeLeft, setTimeLeft] = useState(180)
  const inputFieldRef = useRef(null)
  const timerRef = useRef(null)

  const handleClick = () => {
    const inputField = inputFieldRef.current
    if (inputField) {
      inputField.focus()
      setInputLog([])
      setStartTime(Date.now())
      setTimeLeft(180)

      const interval = setInterval(() => {
        setTimeLeft((prevTimeLeft) => {
          if (prevTimeLeft <= 1) {
            clearInterval(interval)
            return 0
          }
          return prevTimeLeft - 1
        })
      }, 1000)
      timerRef.current = interval

      inputField.addEventListener('input', handleInput)
    }
  }

  const handleInput = (event) => {
    setInputLog((prevInputLog) => [
      ...prevInputLog,
      {
        type: 'input',
        key: event.target.value,
        timestamp: Date.now(),
      },
    ])
  }

  const handleStop = () => {
    clearInterval(timerRef.current)
    if (inputFieldRef.current) {
      inputFieldRef.current.removeEventListener('input', handleInput)
    }
  }

  const handleReplay = () => {
    const textarea = document.getElementById('replayField')
    textarea.value = ''
    const playbackSpeed = 3

    inputLog.forEach((event, index) => {
      const delay = (event.timestamp - inputLog[0].timestamp) / playbackSpeed
      setTimeout(() => {
        if (event.type === 'input') {
          textarea.value = event.key
        }
      }, delay)
    })
  }

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
    }
  }, [])

  return (
    <>
      <Metadata title="Test" description="Test page" />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <StyledTextArea
          ref={inputFieldRef}
          placeholder="ここに入力"
          rows="10"
        />
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleClick}
            style={{ marginRight: '10px' }}
          >
            開始
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleStop}
            style={{ marginRight: '10px' }}
          >
            終了
          </Button>
        </Box>
        <Typography variant="h6" mt={2}>
          残り時間: {timeLeft}秒
        </Typography>
        <StyledTextArea
          id="replayField"
          placeholder="ここに再生"
          rows="10"
          readOnly
        />
        <Box mt={2}>
          <Button variant="contained" color="success" onClick={handleReplay}>
            再生
          </Button>
        </Box>
      </Box>
    </>
  )
}

export default TestPage
