import pywikibot.pagegenerators as pg
import wikitextparser as wtp
import pywikibot
import csv
import io

try:
    filename = 'data/german_standard.csv'
    site = pywikibot.Site('de', 'wiktionary')
    generator = pg.RandomPageGenerator(None, site)
    for page in generator:
        for tmpl in wtp.parse(page.text).templates:
            if tmpl.name in ['Grundformverweis Dekl', 'Grundformverweis Konj']:
                page = pywikibot.Page(site, tmpl.get_arg('1').string.lstrip('|'))
                break
        title = page.title()
        if title.startswith('Flexion:'):
            title = title[8:]
        elif title.startswith('Reim:Deutsch:') or title.startswith('Benutzer:') or \
            title.startswith('Kategorie:') or title.startswith('Wiktionary:') or \
                title.startswith('Diskussion:') or title.endswith('/Gerundivum') or \
                    title.startswith('Vorlage:'):
            continue
        print()
        res = input(title + ' : ')
        if res == '':
            continue
        with io.open(filename, 'a', encoding='utf8', newline='') as file:
            csv.writer(file).writerow([title]+[i.lstrip(' ') for i in res.split(',') if i.strip()!=''])
except KeyboardInterrupt:
    pass