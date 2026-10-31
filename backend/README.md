# AssetFlow Python Flask REST API & SQLite Backend

Enterprise physical asset & resource management ERP backend built with Python Flask and SQLite.

## Features
- **SQLite 3 Database**: Automatic database creation (`assetflow.db`) with zero external service setup.
- **Full REST CRUD**:
  - `GET /api/health` — Service health & database status
  - `GET /api/assets` — List all registered assets
  - `POST /api/assets` — Commission / register a new asset
  - `GET /api/assets/<id>` — Get single asset specifications
  - `PUT /api/assets/<id>` — Update asset details (location, cost, condition)
  - `DELETE /api/assets/<id>` — Decommission / delete asset from inventory
  - `POST /api/assets/<id>/check-in` — Check asset into storage vault (Available)
  - `GET /api/tickets` & `POST /api/tickets` — Defect ticketing & maintenance
  - `GET /api/bookings` & `POST /api/bookings` — Pool resource reservations with temporal collision prevention
  - `GET /api/activity-logs` — Audit trail ledger
  - `POST /api/reset-db` — Reset database to demo ledger
  - `POST /api/clear-db` — Wipe all items for clean zero-state database

## Running the Backend

```bash
cd backend
python3 -m pip install -r requirements.txt
python3 app.py
```
The server will start at `http://localhost:5001`.
