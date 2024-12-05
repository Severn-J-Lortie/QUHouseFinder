# QUHouseFinder

All of Kingston's student listings, aggregated in one place.

## Datasources (implemented and planned)

- Frontenac ✅
- Limetsone ✅
- Axon ✅
- Panadew ✅🚧
  - Only scrapes from the first page. Need to implement multi-page requests
- Heron Management ✅
- Facebook (in progress) 📋
- Ebay (in progress) 📋
- Queen's Community Housing ✅

## TODO
- MVP:
  - Forgot password, delete account
  - Add emails when filters change
    - Send an email with a link to the filter
  - Change: need to not delete every entry at the beginning of each update. Instead, mark entries that aren't found
            by the scraper again and wait a day or so before deleting them. If its from facebook (NYI datasource) then
            let's wait more like 10 days since its a really volatile datasource.
            - Added conflict timestamps. Now just add per datasource rules in the updater to clear old entries (right now everything stays)
- Sort entries by newest first. Just need to store timestamp when we insert the entry
- User filters linkable through query parameters
- User filters 'viewable,' e.g., button to swap them to currently active