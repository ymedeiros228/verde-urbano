# Lê o PDF renderizado e descobre a página (numeração ABNT = física - 1) de cada título/legenda.
import json, re, fitz, unicodedata
E = json.load(open('entries.json', encoding='utf8'))
d = fitz.open('final.pdf')
norm = lambda t: re.sub(r'\s+', ' ', unicodedata.normalize('NFC', t)).strip().upper()
pages = [[norm(l) for l in p.get_text().split('\n') if l.strip()] for p in d]
# início do corpo: primeira página com "1 INTRODUÇÃO" sem linhas pontilhadas
start = next(i for i, ls in enumerate(pages) if '1 INTRODUÇÃO' in ls and not any('....' in l for l in ls))
out, miss = {}, []
def find(items):
    cur = start
    for t in items:
        key = norm(t)
        for i in range(cur, len(pages)):
            txt = ' '.join(pages[i])
            if key in txt or (len(key) > 60 and key[:60] in txt):
                out[t] = i; cur = i; break
        else:
            miss.append(t)
find([e['title'] for e in E['toc']])
find(E['caps']['Figura']); find(E['caps']['Quadro'])
json.dump(out, open('pages.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('páginas:', len(d), 'corpo inicia na física', start + 1, '| faltando:', miss)
