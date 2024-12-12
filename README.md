# QUHouseFinder

All of Kingston's student listings, aggregated in one place.

## Datasources (implemented and planned)

- Frontenac ✅
- Limetsone ✅
- Axon ✅
- Panadew ✅🚧
  - Only scrapes from the first page. Need to implement multi-page requests
- Heron Management ✅
- Facebook (in progress) ✅
- Ebay (in progress) 📋
- Queen's Community Housing ✅

## TODO
- MVP:
  - Forgot password, delete account
  - Add emails when filters change
    - Send an email with a link to the filter
- Refactor: listings should have a method to turn themselves into text representations
- Refactor: listings should have a fromSQL method
- Sort entries by newest first. Just need to store timestamp when we insert the entry