import { useEffect, useRef, useState } from "react";
import { Data, TabooWord } from "./api/getWord";

function useGetWord() {
  const [words, setWords] = useState<TabooWord | undefined>(undefined);
  const neverRun = useRef<boolean>(true);
  async function fetchNewWord() {
    const result = await fetch("/api/getWord?taboos=5&lang=de&name=standard");
    if (!result.ok) {
      throw Error(
        `fetching a new word failed with status ${result.status}: ${result.statusText}`
      );
    }
    const newWord: Data = await result.json();
    if (!newWord.ok) {
      throw newWord.error;
    }
    setWords(newWord.data);
  }
  useEffect(() => {
    if (neverRun.current) {
      neverRun.current = false;
      fetchNewWord();
    }
  }, []);

  return { data: words, refetch: fetchNewWord };
}

export default function Home() {
  const { data, refetch } = useGetWord();

  if (!data) {
    return null;
  }

  return (
    <main className="p-4 max-w-md mx-auto">
      <div className="text-center bg-grey bg-amber-100 rounded-2xl pb-2">
        <div className="bg-amber-300 rounded-t-2xl p-3 mb-1 text-xl bold">
          {data.targetWord}
        </div>
        {data.tabooWords.map((a, i) => (
          <div key={i} className="p-1">
            {a}
          </div>
        ))}
      </div>
      <button
        className="bg-amber-200 rounded-xl p-2 mt-4"
        onClick={() => {
          refetch();
        }}
      >
        TEST
      </button>
    </main>
  );
}
