import { useState, useEffect, useRef } from 'react'

import { Button, Box, Typography } from '@mui/material'
import { styled } from '@mui/system'

import { Metadata } from '@redwoodjs/web'

const StyledTextareaWrapper = styled('div')(({ theme }) => ({
  width: '90%',
  margin: '10px auto',
  display: 'flex',
  flexDirection: 'row',
  borderRadius: '4px',
  border: `1px solid ${theme.palette.grey[400]}`,
  fontFamily: '"Fira code", "Fira Mono", monospace',
  fontSize: '16px',
  maxHeight: '300px',
  overflow: 'auto',
  position: 'relative',
}))

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}))

const NlPage = () => {
  const [inputLog, setInputLog] = useState([])
  const [timeLeft, setTimeLeft] = useState(360)
  const [code, setCode] = useState('')
  const [isRunning, setRun] = useState(false)

  const timerRef = useRef(null)

  const handleClick = () => {
    if (isRunning) return

    setRun(true)
    setCode('')
    setInputLog([])
    setTimeLeft(360)

    const interval = setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        if (prevTimeLeft <= 1) {
          clearInterval(interval)
          handleStop()
          return 0
        }
        return prevTimeLeft - 1
      })
    }, 1000)
    timerRef.current = interval
  }

  const handleInput = (event) => {
    const currentTime = Date.now()
    const value = event.target.value
    setCode(value)
    setInputLog((prevInputLog) => [
      ...prevInputLog,
      {
        value,
        timestamp: currentTime,
      },
    ])
  }

  const handleStop = () => {
    setRun(false)
    clearInterval(timerRef.current)
    alert('制限時間になったか、終了ボタンが押されました！')
    const shouldDownload = window.confirm(
      '入力データのJSONファイルをダウンロードしますか？'
    )
    if (shouldDownload) {
      handleDownloadJson()
    }
  }

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(inputLog, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inputLog.json'
    a.click()
    URL.revokeObjectURL(url)
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
        <Typography variant="h5" mt={2}>
          （自然言語）
        </Typography>
        <StyledTextareaWrapper>
          <textarea
            value={code}
            onChange={handleInput}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 16,
              flexGrow: 1,
              minHeight: '200px',
              border: 'none',
            }}
            placeholder="ここに入力"
          />
        </StyledTextareaWrapper>
        <ButtonContainer>
          <Button
            variant="contained"
            color="primary"
            onClick={handleClick}
            disabled={isRunning}
          >
            開始
          </Button>
          <Button variant="contained" color="secondary" onClick={handleStop}>
            終了
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => (window.location.href = '/play')}
          >
            jsonファイルから再生してみる
          </Button>
        </ButtonContainer>
        <Typography variant="h6" mt={2}>
          残り時間: {timeLeft}秒
        </Typography>
      </Box>
    </>
  )
}

export default NlPage
