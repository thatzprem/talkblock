import type { ContractGuide } from "../index"

export const atomicassets: ContractGuide = {
  contract: "atomicassets",
  chains: ["wax", "eos"],
  summary: "NFT standard: create collections, schemas, templates, mint and transfer NFTs",
  guide: `# atomicassets — NFT Contract Guide

## Key Concepts
- Collection: top-level grouping (e.g. a game or brand)
- Schema: defines attribute types within a collection
- Template: a blueprint with fixed attributes (immutable data)
- Asset: an individual NFT minted from a template

## Transfer NFTs

### transfer — Send NFTs
- account: "atomicassets"
- action: "transfer"
- data:
  - from: (sender)
  - to: (receiver)
  - asset_ids: ["1099512345678"] (array of asset ID strings)
  - memo: "" (string)
- NOTE: asset_ids are large numbers passed as strings.

## Create a Collection

### createcol — Create collection
- account: "atomicassets"
- action: "createcol"
- data:
  - author: (creator account)
  - collection_name: (up to 12 chars)
  - allow_notify: true
  - authorized_accounts: ["author_account"]
  - notify_accounts: []
  - market_fee: 0.05 (5% marketplace fee, decimal)
  - data: [] (serialized collection metadata)

## Create a Schema

### createschema
- account: "atomicassets"
- action: "createschema"
- data:
  - authorized_creator: (must be in collection's authorized_accounts)
  - collection_name: (existing collection)
  - schema_name: (up to 12 chars)
  - schema_format: [{ name: "name", type: "string" }, { name: "img", type: "image" }, { name: "rarity", type: "string" }]

## Mint an NFT

### mintasset
- account: "atomicassets"
- action: "mintasset"
- data:
  - authorized_minter: (must be in authorized_accounts)
  - collection_name: (collection)
  - schema_name: (schema)
  - template_id: 12345 (or -1 for no template)
  - new_asset_owner: (account receiving the NFT)
  - immutable_data: [{ key: "name", value: ["string", "My NFT"] }]
  - mutable_data: []
  - tokens_to_back: []

## Querying NFTs
- Table: code="atomicassets", table="assets", scope=<owner_account> → list owned NFTs
- Table: code="atomicassets", table="collections", scope="atomicassets" → list collections
- Table: code="atomicassets", table="schemas", scope=<collection_name> → list schemas
- Table: code="atomicassets", table="templates", scope=<collection_name> → list templates`,
}
