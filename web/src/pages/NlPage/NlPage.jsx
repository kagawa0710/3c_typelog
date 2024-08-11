import { useState, useEffect, useRef } from 'react'//コンポーネント、ライフサイクル、DOM要素

import { Button, Box, Typography } from '@mui/material'//UIコンポーネント
import { styled } from '@mui/system'//カスタムスタイル
import Prism from 'prismjs'//コードのシンタクスハイライト
import Editor from 'react-simple-code-editor'//コードエディターコンポーネント

import 'prismjs/themes/prism.css'//シンタクスハイライトのデザイン
import 'prismjs/components/prism-javascript'
import { Metadata, navigate } from '@redwoodjs/web'

const StyledEditorWrapper = styled('div')(({ theme }) => ({
  width: '90%',
  margin: '10px auto',
  display: 'flex',
  flexDirection: 'row',
  borderRadius: '4px',
  border: `1px solid ${theme.palette.grey[400]}`,
  fontFamily: '"Fira code", "Fira Mono", monospace',
  fontSize: '16px',
  '& pre': {
    margin: 0,
    padding: '10px',
    background: 'transparent',
  },
  maxHeight: '300px',
  overflow: 'auto',
  position: 'relative',
}))

// const LineNumbers = styled('div')(({ theme, lines }) => ({
//   fontFamily: 'Fira code, Fira Mono, monospace',
//   fontSize: '16px',
//   lineHeight: '1.5',
//   padding: '10px 0 10px 10px',
//   borderRight: `1px solid ${theme.palette.grey[400]}`,
//   userSelect: 'none',
//   textAlign: 'right',
//   color: theme.palette.text.secondary,
//   position: 'absolute',
//   left: 0,
//   top: 0,
//   bottom: 0,
//   width: `${String(lines).length + 2}ch`,
// }))

const ButtonContainer = styled(Box)(({ theme }) => ({//Material UIのBoxコンポーネント　カスタム
  display: 'flex',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}))

const NlPage = () => {
  const [inputLog, setInputLog] = useState([])//入力に対するデータ、タイムスタンプ保持。inputlogの状態を更新
  const [startTime, setStartTime] = useState(null)//入力が開始された時間を保持。更新
  const [timeLeft, setTimeLeft] = useState(360)//デフォルトは360秒。更新
  const [code, setCode] = useState('')//ユーザーが入力したコードを保持。更新
  const [playbackSpeed, setPlaybackSpeed] = useState(1)//再生速度を管理する値。更新
  const [highlightThreshold, setHighlightThreshold] = useState(3000)//ハイライトをする基準時間を保持。更新
  const [highlightLines, setHighlightLines] = useState(false)//ハイライトをする行を保持
  const timerRef = useRef(null)//タイマー参照を保持

  const handleClick = () => {//開始ボタンが押された際に呼び出される
    setCode('')//コードリセット
    setInputLog([])//入力ログ
    setStartTime(Date.now())//開始時間を現在に
    setTimeLeft(360)//残り時間を360秒

    const interval = setInterval(() => {//1秒ごとに減少される①
      setTimeLeft((prevTimeLeft) => {//残り時間を更新,prevTimeLeft=直前の時間
        if (prevTimeLeft <= 1) {//残り1秒以下になったら終了
          clearInterval(interval)//タイマー停止
          handleStop()//タイマー終了時の処理
          return 0
        }
        return prevTimeLeft - 1//時間がある場合、時間を減らす
      })
    }, 1000)//①
    timerRef.current = interval//timeref(61行目)で保存
  }
//ここで文字の入力、削除など一定期間のデータを保存
  const handleInput = (value) => {//入力時に書き込み、value(ユーザーが入力する値（テキスト、コード）)
    const currentTime = Date.now()//現在の時間をミリ秒単位で取得
    setCode(value)
    setInputLog((prevInputLog) => [//今まで記録されてきた配列状態を更新
      ...prevInputLog,//今までの入力ログを配列に（入力、削除）
      {
        value,
        timestamp: currentTime,
      },
    ])
  }

  const handleStop = () => {
    clearInterval(timerRef.current)//動作中のタイマーを停止
    alert('制限時間になったか、終了ボタンが押されました！')
    const shouldDownload = window.confirm(
      '入力データのJSONファイルをダウンロードしますか？'
    )
    if (shouldDownload) {//OKの場合、ダウンロード開始
      handleDownloadJson()
    }
  }

  const handleSpeedChange = (event) => {//再生速度変化
    setPlaybackSpeed(event.target.value)
  }

  const handleThresholdChange = (event) => {//閾値変化
    setHighlightThreshold(event.target.value)
  }

  const handleDownloadJson = () => {//ダウンロード（jsonファイル）
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

  useEffect(() => {//webページを開いてコンポーネントがあった場合（マウントする）、画面から取り除かれる際（アンマウント
    return () => {
      clearInterval(timerRef.current)
    }
  }, [])

  // const getHighlightedLineNumbers = () => {//入力ログを確認し、ハイライトをする行を取得
  //   const highlightedLines = new Set()//ハイライトする値を重複なく格納
  //   inputLog.forEach((log, index) => {//入力ログをもとに書き込みデータのlogを配列に入れる
  //     if (log.timeTaken > highlightThreshold && code.split('\n')[index]) {//入力ログデータ全てを確認し、ハイライトする文字かを判定
  //       highlightedLines.add(index + 1)
  //     }
  //   })
  //   return highlightedLines
  // }

  //const highlightedLines = getHighlightedLineNumbers()//input.logを解析し、ハイライトする行数を特定

  const lines = code.split('\n').length//文字列を分割する

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
        <StyledEditorWrapper lines={lines}>
          {/* <LineNumbers lines={lines}>
            {Array.from({ length: lines }, (_, i) => i + 1).join('\n')}
          </LineNumbers> */}
          <Editor
            value={code}
            onValueChange={handleInput}
            highlight={(code) => code} //（変更点：ハイライト

            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 16,
              flexGrow: 1,
              minHeight: '200px',
              marginLeft: `${String(lines).length + 2}ch`,
              border: 'none',
            }}
            placeholder="ここに入力"
          />
        </StyledEditorWrapper>
        <ButtonContainer>
          <Button variant="contained" color="primary" onClick={handleClick}>
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
