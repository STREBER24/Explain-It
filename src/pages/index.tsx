import { useEffect, useRef, useState } from "react"
import { Data, TabooWord } from "./api/getWord"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown } from "@fortawesome/free-solid-svg-icons/faChevronDown"
import { faChevronUp } from "@fortawesome/free-solid-svg-icons/faChevronUp"

function useGetWord() {
  const [words, setWords] = useState<TabooWord | undefined>(undefined)
  const neverRun = useRef<boolean>(true)
  async function fetchNewWord() {
    const result = await fetch(
      "/api/getWord?taboos=5&lang=de&name=standard&mode=raw"
    )
    if (!result.ok) {
      throw Error(
        `fetching a new word failed with status ${result.status}: ${result.statusText}`
      )
    }
    const newWord: Data = await result.json()
    if (!newWord.ok) {
      throw newWord.error
    }
    setWords(newWord.data)
  }
  useEffect(() => {
    if (neverRun.current) {
      neverRun.current = false
      fetchNewWord()
    }
  }, [])

  return { data: words, refetch: fetchNewWord }
}

export default function Home() {
  const { data, refetch } = useGetWord()
  const [history, setHistory] = useState<TabooWord[]>([])

  if (!data) {
    return null
  }

  return (
    <main className="p-4 max-w-md mx-auto bg-white min-h-screen">
      <CardView {...data} mainView={true} />
      <button
        className="bg-amber-200 rounded-xl p-2 my-4 w-full text-xl"
        onClick={() => {
          history.push(data)
          setHistory(history)
          refetch()
        }}
      >
        Weiter
      </button>
      {history.toReversed().map((task, i) => (
        <CardView {...task} mainView={false} key={i} />
      ))}
    </main>
  )
}

function CardView(props: {
  targetWord: string
  blockedWords: string[]
  mainView: boolean
}) {
  const [expanded, setExpanded] = useState(props.mainView)
  return (
    <div
      className={`text-center rounded-2xl my-1 ${
        props.mainView ? "bg-amber-100" : ""
      }`}
    >
      <div
        className={`${
          props.mainView ? "bg-amber-200" : "bg-slate-200"
        } rounded-t-2xl flex ${expanded ? "text-xl p-3" : "rounded-2xl py-1 px-2"}`}
        onClick={() => setExpanded(!expanded)}
      >
        {props.mainView ? null : (
          <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} />
        )}
        <span className="w-full">{props.targetWord}</span>
      </div>
      {expanded ? (
        <div className={props.mainView ? "" : "border border-slate-200"}>
          {props.blockedWords.map((a, i) => (
            <div key={i} className="p-1">
              {a}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
