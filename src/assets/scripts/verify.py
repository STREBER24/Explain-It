import json
import csv
import io

prefix = 'src/assets/data/'

with io.open(prefix+'directory.json', encoding='utf8') as file:
    directory: dict[str,dict] = json.load(file)

for languageCode, variants in directory.items():
    for name, info in variants.items():
        filename = info.get('raw_filename')
        if filename is None:
            print(f'raw_filename missing on {languageCode}:{name}')
            continue
        if info.get('graph_filename') is None:
            print(f'graph_filename missing on {languageCode}:{name}')
            continue
        existing: set[str] = set()
        graph: dict[str,set[str]] = {}
        def addToGraph(key: str, val: str):
            if graph.get(key) == None:
                graph[key] = set()
            graph[key].add(val)
        with io.open(prefix+filename, encoding='utf8') as file:
            reader = csv.reader(file)
            for row in reader:
                if len(row) == 0:
                    print(filename, 'empty row')
                    continue
                if '' in row:
                    print(filename, 'empty word', row)
                if row[0] in existing:
                    print(filename, 'duplicate', row[0])
                else:
                    existing.add(row[0])
                for i in row[1:]:
                    addToGraph(row[0], i)
                    addToGraph(i, row[0])
        with io.open(prefix+info['graph_filename'], 'w', encoding='utf8', newline='') as file:
            writer = csv.writer(file)
            for key, words in sorted(graph.items()):
                writer.writerow([key]+list(words))
