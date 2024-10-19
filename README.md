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
- Persistent session storage
- Filter CRUD (e.g. users can add a filter to be notifed on and change/delete it)
    - Backend support involes pushing the filter object to the database
    - Fetch filters on page load
    - Delete filter support
    - Edit filter support
      - Factor out filer validation so that add and modify basically the same
- Add emails when filters change
  - Filter to SQL conversion
