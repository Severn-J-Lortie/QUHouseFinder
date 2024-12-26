# QUHouseFinder

All of Kingston's student listings, aggregated in one place.

## Datasources (implemented and planned)

- Frontenac ✅
- Limetsone ✅
- Axon ✅
- Panadew ✅🚧
  - Only scrapes from the first page. Need to implement multi-page requests
- Heron Management ✅
- Facebook ✅
- Ebay📋
- Queen's Community Housing ✅

## TODO
- MVP:
  - Forgot password, delete account
- Refactor: listings should have a method to turn themselves into text representations
- Refactor: listings should have a fromSQL method
- Sort entries by newest first. Just need to store timestamp when we insert the entry
- Add "last updated" card
- Add a map embed in the description dropdown
- User submissions
- Better monitoring
- Refactor: move all .env logic into a single class call
- **Bugfix**: Facebook datasource needs to restore session from saved cookie file. Until then,
the whole web scraper has been stopped on prod.