import { wordFiles } from "@/assets/data/directoryInfo"
import { NextApiRequest, NextApiResponse } from "next"
import { randomInt } from "crypto"
import { parse } from "csv/sync"
import fs from "fs"

export type TabooWord = { targetWord: string; blockedWords: string[] }
export type Data = { ok: false; error: string } | { ok: true; data: TabooWord }

function loadFiles(filename: string) {
  return new Map(
    fs
      .readFileSync(`${process.env.ASSETS_PATH}/${filename}`, "utf8")
      .split("\n")
      .slice(1)
      .flatMap((a) => {
        const parsed: string[] | undefined = parse(a)[0]
        if (!parsed) {
          return []
        }
        return [[parsed[0], parsed.slice(1)]]
      })
  )
}

function extractWord(
  file: Map<string, string[]>,
  numberOfBlockedWords: number
) {
  const keys = Array.from(file.keys())
  const targetWord = keys[randomInt(keys.length)]
  var blockedWords: string[] = []
  while (blockedWords.length < numberOfBlockedWords) {
    var newWords = [targetWord, ...blockedWords]
      .flatMap((i) => file.get(i))
      .filter((a) => a)
      .map((a) => a!)
      .filter((a) => ![targetWord, ...blockedWords].includes(a))
    if (newWords.length === 0) {
      return extractWord(file, numberOfBlockedWords)
    }
    while (newWords.length + blockedWords.length > numberOfBlockedWords) {
      newWords = newWords.splice(randomInt(newWords.length))
    }
    newWords.map((a) => blockedWords.push(a))
  }
  const shuffled = blockedWords.sort(() => Math.random() - 0.5)
  return { targetWord, blockedWords: shuffled }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { searchParams } = new URL(req.url ?? "", "http://test.test")

  const taboos = parseInt(searchParams.get("taboos") ?? "")
  if (isNaN(taboos) || taboos < 0 || taboos > 15) {
    res.status(400).json({
      ok: false,
      error: "search param taboos has to be an integer between 0 and 15",
    })
    return
  }

  const validLanguages = Object.keys(wordFiles)
  const language = searchParams.get("lang")
  if (language === null || !validLanguages.includes(language)) {
    res.status(400).json({
      ok: false,
      error: `search param lang has to be ${validLanguages.map((a) => `"${a}"`).join(" or ")}`,
    })
    return
  }

  const variantFiles = wordFiles[language]
  const validNames = Object.keys(variantFiles)
  const name = searchParams.get("name")
  if (name === null || !validNames.includes(name)) {
    res.status(400).json({
      ok: false,
      error: `search param name has to be ${validNames.map((a) => `"${a}"`).join(" or ")}`,
    })
    return
  }
  const variant = variantFiles[name]

  const mode = searchParams.get("mode")
  if (mode !== "raw" && mode !== "graph") {
    res.status(400).json({
      ok: false,
      error: `search param mode has to be "raw" or "graph"`,
    })
    return
  }

  const filename =
    mode === "raw" ? variant.raw_filename : variant.graph_filename
  const file = loadFiles(filename)

  res.status(200).json({ ok: true, data: extractWord(file, taboos) })
}
