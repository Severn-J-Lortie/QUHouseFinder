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
_ **Databse not fully setup -- need to bring in existing schema ~~
- Finish deplopying (currently the static site is up but need to add the backend stuff)....
- MVP:
  - Forgot password, delete account
  - Add emails when filters change
    - Send an email with a link to the filter
- Refactor: listings should have a method to turn themselves into text representations
- Refactor: listings should have a fromSQL method
- Sort entries by newest first. Just need to store timestamp when we insert the entry