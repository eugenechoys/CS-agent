# Live Data Manifest

The CS demo uses a curated read-only catalog derived from the vendored Hoppscotch collection.

Current curated domains:
- tenant list and tenant detail
- tenant users
- user insurance
- tenant activity
- tenant mood trends
- recognition feed
- coin insights
- surveys

Rules:
- Prefer curated requests over arbitrary endpoint guessing.
- Treat all live results as read-only support context.
- If a live request fails, fall back safely and say what data was unavailable.
