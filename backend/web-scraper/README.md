# QUHouseFinder Web Scraper

## Currently implemented sources

- Frontenac
- Limetsone
- Axon
- Panadew
- Heron Management
- Facebook
- Ebay
- Queen's Community Housing

## Design plan

```mermaid
---
title: Web Scraper
---
classDiagram
  class Listing {
    +String hash
    +String address
    +String landlord
    +Number pricePerBed
    +Number beds
    +Date leaseStartDate
    +String link
    +constructor(JSON | HTML, selectors)
    
  }
  class Datasource {
    +String link
    +String name
    +Listing[] fetchListings()
  }
  note for Updater "update will also make a change to the Database"
  class Updater {
    +DataSource[] sources
    +Listing[] update()
  }
  class Database {
    +constructor()
    +query()
  }

```

## TODO

- Make nullable columns in the database not "not null"