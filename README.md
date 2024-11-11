# QUHouseFinder

All of Kingston's student listings, aggregated in one place.

## Datasources (implemented and planned)

- Frontenac ✅
- Limetsone ✅
- Axon ✅
- Panadew ✅
- Heron Management ✅
- Facebook (in progress) 📋
- Ebay (in progress) 📋
- Queen's Community Housing ✅

## TODO
- Forgot password, delete account
- Add emails when filters change
  - Filter to SQL conversion
- Change: need to not delete every entry at the beginning of each update. Instead, mark entries that aren't found
          by the scraper again and wait a day or so before deleting them. If its from facebook (NYI datasource) then
          let's wait more like 10 days since its a really volatile datasource.
