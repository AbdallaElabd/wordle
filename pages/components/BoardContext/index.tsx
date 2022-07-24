import { Board, BoardStatus } from 'pages/types/board'
import { trpc } from 'pages/utils/trpc'
import { getBoardWithCurrentGuess } from 'pages/utils/wordle/board'
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState
} from 'react'
import { useKey } from 'react-use'

type BoardContextType = {
  board: Board | null
  boardWithCurrentGuess: Board | null
  boardStatus: BoardStatus
  id: string | null
  guess: string
  setGuess: (guess: string) => void
  submitGuess: (guess: string) => void
  isSubmittingGuess: boolean
  error: string | null
  setError: (error: string | null) => void
  onBackspace: () => void
  onEnter: () => void
  onKeyPress: (key: string) => void
}

export const BoardContext = createContext<BoardContextType>({
  board: null,
  boardWithCurrentGuess: null,
  id: null,
  boardStatus: BoardStatus.InProgress,
  guess: '',
  setGuess: () => {},
  submitGuess: () => {},
  isSubmittingGuess: false,
  error: null,
  setError: () => {},
  onBackspace: () => {},
  onEnter: () => {},
  onKeyPress: () => {}
})

export const useBoardProvider = () => useContext(BoardContext)

export const BoardProvider = ({ children }: PropsWithChildren) => {
  const [id, setId] = useState<string | null>(
    window.localStorage.getItem('gameId')
  )
  const [board, setBoard] = useState<Board | null>(null)
  const [boardStatus, setBoardStatus] = useState<BoardStatus>(
    BoardStatus.InProgress
  )
  const [guess, setGuess] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  trpc.useQuery(['game.startGame', { gameId: id }], {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    onSuccess(data) {
      setBoard(data.board)
      setBoardStatus(data.boardStatus)
      setId(data.id)
      window.localStorage.setItem('gameId', data.id)
    }
  })

  const { mutate: mutateSubmitGuess, isLoading: isSubmittingGuess } =
    trpc.useMutation('game.submitGuess', {
      onSuccess: ({ newBoard, boardStatus }) => {
        setBoard(newBoard)
        setBoardStatus(boardStatus)
        setGuess('')
        setError(null)
      },
      onError: (error) => {
        setError(error.message)
      }
    })

  const submitGuess = useCallback(
    (guess: string) =>
      mutateSubmitGuess({
        gameId: window.localStorage.getItem('gameId') as string,
        guess
      }),
    [mutateSubmitGuess]
  )

  const boardWithCurrentGuess = getBoardWithCurrentGuess(board, guess)

  const onKeyPress = useCallback(
    (key: string) => {
      if (boardStatus !== BoardStatus.InProgress) return
      if (guess.length >= 5) return
      const newGuess = `${guess}${key}`
      setGuess(newGuess)
    },
    [boardStatus, guess]
  )

  useKey(
    (event) =>
      event.code.match(/Key[A-Z]/) != null &&
      event.key.match(/([a-z]|(A-Z))/) != null,
    ({ key }) => onKeyPress(key),
    undefined,
    [onKeyPress]
  )

  const onBackspace = useCallback(() => {
    if (boardStatus !== BoardStatus.InProgress) return
    if (guess.length <= 5 && guess.length > 0) {
      setGuess(guess.slice(0, guess.length - 1))
    }
  }, [boardStatus, guess])

  useKey('Backspace', onBackspace, undefined, [onBackspace])

  const onEnter = useCallback(() => {
    if (boardStatus !== BoardStatus.InProgress) return
    submitGuess(guess)
  }, [boardStatus, guess, submitGuess])

  useKey('Enter', onEnter, undefined, [onEnter])

  return (
    <BoardContext.Provider
      value={{
        id,
        board,
        boardStatus,
        boardWithCurrentGuess,
        guess,
        setGuess,
        submitGuess,
        isSubmittingGuess,
        onBackspace,
        onEnter,
        onKeyPress,
        error,
        setError
      }}
    >
      {children}
    </BoardContext.Provider>
  )
}