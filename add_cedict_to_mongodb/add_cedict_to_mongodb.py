# -*- coding: utf-8 -*-

from pymongo import MongoClient
from sys import argv
from re import search

client = MongoClient()
db = client.zh_api

print('Removing old entries...')
db.cedict.remove()

print('Adding new entries...')
with open(argv[1]) as infile:
    for (index, line) in enumerate([l.strip() for l in infile.readlines()]):
        if line[0] is '#':
            continue
        print('.', end='', flush=True)
        if index % 5000 == 0:
            print(index, end='', flush=True)

        record = {}
        m = search('(.+?) (.+?) \[(.+?)\] (.+)', line)
        if m:
            record['trad'] = m.group(1)
            record['simp'] = m.group(2)
            record['pinyin'] = m.group(3)
            record['english'] = m.group(4)
            
            db.cedict.save(record)

print('')
print('Creating indices')
db.cedict.ensure_index('simp')
db.cedict.ensure_index('trad')
