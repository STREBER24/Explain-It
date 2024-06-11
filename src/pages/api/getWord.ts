import { NextApiRequest, NextApiResponse } from "next";
import { randomInt } from "crypto";
import { parse } from "csv/sync";
import fs from "fs";

export type TabooWord = { targetWord: string; tabooWords: string[] };
export type Data = { ok: false; error: string } | { ok: true; data: TabooWord };

enum Modes {
  raw,
  fill,
  free,
}

function loadFiles(filename: string) {
  return new Map(
    fs
      .readFileSync(`${process.env.ASSETS_PATH}/${filename}`, "utf8")
      .split("\n")
      .slice(1)
      .flatMap((a) => {
        const parsed: string[] | undefined = parse(a)[0];
        if (!parsed) {
          return [];
        }
        return [[parsed[0], parsed.slice(1)]];
      })
  );
}

function extractWord(file: Map<string, string[]>, numberOfTabooWords: number) {
  const keys = Array.from(file.keys());
  const targetWord = keys[randomInt(keys.length)];
  var tabooWords: string[] = [];
  while (tabooWords.length < numberOfTabooWords) {
    var newWords = [targetWord, ...tabooWords]
      .flatMap((i) => file.get(i)!)
      .filter((a) => ![targetWord, ...tabooWords].includes(a));
    if (newWords.length === 0) {
      return extractWord(file, numberOfTabooWords);
    }
    while (newWords.length + tabooWords.length > numberOfTabooWords) {
      newWords = newWords.splice(randomInt(newWords.length));
    }
    newWords.map((a) => tabooWords.push(a));
  }
  const shuffled = tabooWords.sort(() => Math.random() - 0.5);
  return { targetWord, tabooWords: shuffled };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { searchParams } = new URL(req.url ?? "", "http://test.test");

  const taboos = parseInt(searchParams.get("taboos") ?? "");
  if (isNaN(taboos) || taboos < 0 || taboos > 15) {
    res.status(400).json({
      ok: false,
      error: "search param taboos has to be an integer between 0 and 15",
    });
    return;
  }

  const wordFiles: Record<
    string,
    Record<
      string,
      { description: string; raw_filename: string; graph_filename: string }
    >
  > = JSON.parse(
    fs.readFileSync(`${process.env.ASSETS_PATH}/directory.json`, "utf8")
  );

  const validLanguages = Object.keys(wordFiles);
  const language = searchParams.get("lang");
  if (language === null || !validLanguages.includes(language)) {
    res.status(400).json({
      ok: false,
      error: `search param lang has to be ${validLanguages.map((a) => `"${a}"`).join(" or ")}`,
    });
    return;
  }

  const variantFiles = wordFiles[language];
  const validNames = Object.keys(variantFiles);
  const name = searchParams.get("name");
  if (name === null || !validNames.includes(name)) {
    res.status(400).json({
      ok: false,
      error: `search param name has to be ${validNames.map((a) => `"${a}"`).join(" or ")}`,
    });
    return;
  }

  const variant = variantFiles[name];

  const file = loadFiles(variant.graph_filename);

  res.status(200).json({ ok: true, data: extractWord(file, taboos) });
}
