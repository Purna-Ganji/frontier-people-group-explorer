# People Group Explorer

A lightweight React prototype for exploring, filtering, and shortlisting unreached people groups from a messy real-world dataset.

## Live Demo

https://frontier-people-group-explorer.vercel.app/

## Repository

https://github.com/Purna-Ganji/frontier-people-group-explorer

## What it does

- Cleans and normalizes inconsistent people-group data
- Merges duplicate records
- Supports search by group name and country
- Filters by region, country, religion, language, Bible status, evangelical percentage, and population
- Supports diacritic-insensitive and alias-aware search
- Lets users build a shortlist
- Preserves filters and shortlist in the URL so the current view can be shared

## Time Spent

Approximately 3 hours.

## Hardest Decision

The hardest decision was how aggressively to merge duplicate records. I chose to follow the provided rules exactly and merge only when the canonicalized people-group name and country matched, rather than using fuzzy matching. This reduces the risk of incorrectly combining distinct groups.

## One Thing I Know Is Hacky

The prototype loads the CSV directly in the client and keeps all filtering and reconciliation logic in the frontend. This works well for a dataset of this size, but a larger production system would benefit from moving data processing behind an API or dedicated data layer.

## Correctness

Verified core cases include:

- 220 raw records
- 199 distinct groups
- 19 groups with duplicates
- 40 South Asia groups
- 73 groups with population 1M+
- 9 groups with population under 10k
- 39 groups with unknown population
- 26 groups where language includes Arabic
- 134 groups with Islam as the primary religion
- 33 Islam + Sub-Saharan Africa groups
- `uyghur` search returns 2 groups

## AI Usage

I used ChatGPT to help scaffold parts of the React UI, review edge cases in the normalization logic, and speed up implementation of filtering and shareable URL state. I manually checked the generated logic against the provided challenge rules and corrected assumptions when the initial implementation did not match the expected counts.
