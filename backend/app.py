import os
import sqlite3
import json
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS for all routes (supports development on localhost:5173, etc.)
CORS(app, resources={r"/api/*": {"origins": "*"}})

DB_PATH = os.path.join(os.path.dirname(__file__), 'assetflow.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(seed=True):
    conn = get_db()
    cursor = conn.cursor()

    # 1. Assets Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        tag TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        serial_number TEXT,
        category_id TEXT,
        category_name TEXT,
        department_id TEXT,
        department_name TEXT,
        status TEXT NOT NULL,
        condition TEXT NOT NULL,
        cost_tracking REAL,
        location TEXT,
        commission_date TEXT,
        warranty_expiry_date TEXT,
        is_bookable INTEGER DEFAULT 0,
        current_holder_id TEXT,
        current_holder_name TEXT,
        current_holder_avatar TEXT,
        expected_return_date TEXT,
        created_at TEXT
    )
    ''')

    # 2. Departments Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        head_id TEXT,
        head_name TEXT,
        is_active INTEGER DEFAULT 1,
        member_count INTEGER DEFAULT 0,
        allocated_asset_count INTEGER DEFAULT 0,
        budget_code TEXT
    )
    ''')

    # 3. Categories Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        description TEXT,
        asset_count INTEGER DEFAULT 0
    )
    ''')

    # 4. Maintenance Tickets Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS maintenance_tickets (
        id TEXT PRIMARY KEY,
        ticket_number TEXT UNIQUE NOT NULL,
        asset_id TEXT NOT NULL,
        asset_tag TEXT NOT NULL,
        asset_name TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL,
        reported_by_id TEXT,
        reported_by_name TEXT,
        issue_description TEXT NOT NULL,
        assigned_technician TEXT,
        created_at TEXT
    )
    ''')

    # 5. Resource Bookings Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS resource_bookings (
        id TEXT PRIMARY KEY,
        resource_id TEXT NOT NULL,
        resource_name TEXT NOT NULL,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        purpose TEXT NOT NULL,
        booked_by_user_id TEXT,
        booked_by_user_name TEXT,
        status TEXT NOT NULL,
        created_at TEXT
    )
    ''')

    # 6. Transfer Requests Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS transfer_requests (
        id TEXT PRIMARY KEY,
        asset_id TEXT NOT NULL,
        asset_tag TEXT NOT NULL,
        asset_name TEXT NOT NULL,
        from_user_id TEXT,
        from_user_name TEXT,
        to_user_id TEXT,
        to_user_name TEXT,
        department_name TEXT,
        request_date TEXT,
        reason TEXT,
        status TEXT NOT NULL
    )
    ''')

    # 7. Activity Logs Table (Audit Trail)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        actor_id TEXT,
        actor_name TEXT NOT NULL,
        actor_role TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        asset_id TEXT,
        asset_tag TEXT,
        asset_name TEXT,
        previous_state TEXT,
        new_state TEXT,
        notes TEXT
    )
    ''')

    conn.commit()

    if seed:
        cursor.execute('SELECT COUNT(*) as count FROM assets')
        count = cursor.fetchone()['count']
        if count == 0:
            seed_initial_data(conn)

    conn.close()

def seed_initial_data(conn):
    cursor = conn.cursor()

    # Seed Departments
    departments = [
        ('dept-ops', 'Executive & Governance Operations', 'OPS', 'usr-admin-1', 'Eleanor Vance', 1, 8, 24, 'CC-9001'),
        ('dept-it', 'IT & Infrastructure Systems', 'IT', 'usr-mgr-1', 'Marcus Sterling', 1, 14, 142, 'CC-4210'),
        ('dept-eng', 'Engineering & Core R&D', 'ENG', 'usr-dept-1', 'Sarah Jenkins', 1, 45, 230, 'CC-1020'),
        ('dept-dsn', 'Product & UX Design Studio', 'DSN', 'usr-emp-3', 'Alex Rivera', 1, 12, 54, 'CC-3100'),
        ('dept-fac', 'Facilities & Corporate Fleet', 'FAC', 'usr-emp-2', 'Elena Rostova', 1, 6, 18, 'CC-7000')
    ]
    cursor.executemany('''
    INSERT OR REPLACE INTO departments VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', departments)

    # Seed Categories
    categories = [
        ('cat-comp', 'Computing Hardware', 'COMP', 'Laptops, desktop workstations, and mobile devices', 140),
        ('cat-infra', 'Infrastructure & Telecom', 'INFRA', 'Rack servers, network switches, and UPS hardware', 35),
        ('cat-av', 'AV & Conference Equipment', 'AV', 'Cameras, cinema kits, microphones, and studio monitors', 22),
        ('cat-tools', 'Heavy Machinery & Tools', 'TOOL', 'Precision optical test benches, scopes, and cleanroom rigs', 15),
        ('cat-fleet', 'Vehicles & Fleet', 'FLT', 'Executive sedans, transit vans, and EV charging units', 8)
    ]
    cursor.executemany('''
    INSERT OR REPLACE INTO categories VALUES (?, ?, ?, ?, ?)
    ''', categories)

    # Seed Assets
    assets = [
        ('ast-1', 'AF-0001', 'MacBook Pro 16" M3 Max (36GB/1TB)', 'C02G40ALMD6M', 'cat-comp', 'Computing Hardware', 'dept-dsn', 'Product & UX Design Studio', 'Allocated', 'Good', 3499.0, 'Floor 4 - Studio Desk 12', '2024-01-15', '2027-01-15', 0, 'usr-emp-3', 'Alex Rivera', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', '2026-10-28', '2024-01-15 09:00:00'),
        ('ast-2', 'AF-0002', 'Dell UltraSharp 32" 4K USB-C Hub Monitor', 'CN-09381-71618', 'cat-comp', 'Computing Hardware', 'dept-dsn', 'Product & UX Design Studio', 'Available', 'New', 899.0, 'Bay 2 - Tech Depot Storage', '2024-02-01', '2027-02-01', 0, None, None, None, None, '2024-02-01 10:00:00'),
        ('ast-3', 'AF-0003', 'Dell PowerEdge R750xs 2U Rack Server', 'SV-R750-89102', 'cat-infra', 'Infrastructure & Telecom', 'dept-it', 'IT & Infrastructure Systems', 'Under Maintenance', 'Fair', 8400.0, 'Datacenter Alpha - Rack 04', '2023-11-10', '2026-11-10', 0, None, None, None, None, '2023-11-10 11:30:00'),
        ('ast-4', 'AF-0004', 'Sony FX3 Cinema Camera Kit + 24-70 GM II', 'SN-FX3-99120', 'cat-av', 'AV & Conference Equipment', 'dept-ops', 'Executive & Governance Operations', 'Available', 'Good', 4899.0, 'Storage Vault B - Cabinet 1', '2024-03-05', '2026-03-05', 1, None, None, None, None, '2024-03-05 14:15:00'),
        ('ast-5', 'AF-0005', 'Keyence VHX-7000 Digital Microscope', 'KY-VHX-0012', 'cat-tools', 'Heavy Machinery & Tools', 'dept-eng', 'Engineering & Core R&D', 'Allocated', 'Good', 42000.0, 'Optics Cleanroom 02 - Bench 4', '2023-08-20', '2028-08-20', 0, 'usr-emp-4', 'Priyah Patel', 'https://images.unsplash.com/photo-1534751516642-a171edd25218?w=150', '2026-11-20', '2023-08-20 08:30:00'),
        ('ast-6', 'AF-0006', 'Tesla Model Y Long Range (Corporate Fleet #02)', '5YJ3E1EB8NF10', 'cat-fleet', 'Vehicles & Fleet', 'dept-fac', 'Facilities & Corporate Fleet', 'Allocated', 'Good', 48990.0, 'P1 Executive Parking - Stall 14', '2023-05-18', '2027-05-18', 1, 'usr-emp-2', 'Elena Rostova', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', '2026-10-27', '2023-05-18 12:00:00')
    ]
    cursor.executemany('''
    INSERT OR REPLACE INTO assets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', assets)

    # Seed Maintenance Tickets
    tickets = [
        ('tkt-1', 'TKT-1049', 'ast-3', 'AF-0003', 'Dell PowerEdge R750xs 2U Rack Server', 'Critical', 'In Progress', 'usr-mgr-1', 'Marcus Sterling', 'Secondary redundant PSU (PSU 2) reporting degraded voltage threshold diagnostics in Bay 4.', 'Marcus Sterling', '2026-10-30 08:30:00'),
        ('tkt-2', 'TKT-1050', 'ast-1', 'AF-0001', 'MacBook Pro 16" M3 Max (36GB/1TB)', 'High', 'Pending', 'usr-emp-3', 'Alex Rivera', 'Trackpad haptic feedback inconsistent and top left USB-C port loose.', None, '2026-10-30 09:15:00')
    ]
    cursor.executemany('''
    INSERT OR REPLACE INTO maintenance_tickets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', tickets)

    # Seed Bookings
    bookings = [
        ('bkg-1', 'ast-4', 'Sony FX3 Cinema Camera Kit + 24-70 GM II', '2026-10-30', '14:00', '16:00', 'Sprint demo recording & executive keynote filming', 'usr-dept-1', 'Sarah Jenkins', 'Active', '2026-10-29 10:00:00'),
        ('bkg-2', 'ast-6', 'Tesla Model Y Long Range (Corporate Fleet #02)', '2026-10-27', '09:00', '17:00', 'Client site visit — Austin Gigafactory transit', 'usr-emp-2', 'Elena Rostova', 'Completed', '2026-10-26 15:00:00')
    ]
    cursor.executemany('''
    INSERT OR REPLACE INTO resource_bookings VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', bookings)

    conn.commit()

# --- HELPER FUNCTIONS ---
def dict_from_row(row):
    return dict(row) if row else None

def record_activity(action, actor_name, actor_role, notes, asset_id=None, asset_tag=None, asset_name=None, prev_state=None, new_state=None):
    conn = get_db()
    cursor = conn.cursor()
    log_id = f"act-{int(datetime.now().timestamp()*1000)}"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute('''
    INSERT INTO activity_logs (id, action, actor_name, actor_role, timestamp, asset_id, asset_tag, asset_name, previous_state, new_state, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (log_id, action, actor_name, actor_role, timestamp, asset_id, asset_tag, asset_name, prev_state, new_state, notes))
    conn.commit()
    conn.close()

# ==============================================================================
# REST API ENDPOINTS
# ==============================================================================

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'online',
        'service': 'AssetFlow ERP Python Flask Backend',
        'database': 'SQLite 3 (assetflow.db)',
        'timestamp': datetime.now().isoformat()
    })

# --- ASSETS CRUD ---

@app.route('/api/assets', methods=['GET'])
def get_assets():
    conn = get_db()
    cursor = conn.cursor()

    query = 'SELECT * FROM assets ORDER BY id ASC'
    cursor.execute(query)
    rows = cursor.fetchall()
    assets = []
    for r in rows:
        d = dict_from_row(r)
        d['isBookable'] = bool(d.pop('is_bookable'))
        d['serialNumber'] = d.pop('serial_number')
        d['categoryId'] = d.pop('category_id')
        d['categoryName'] = d.pop('category_name')
        d['departmentId'] = d.pop('department_id')
        d['departmentName'] = d.pop('department_name')
        d['costTracking'] = d.pop('cost_tracking')
        d['commissionDate'] = d.pop('commission_date')
        d['warrantyExpiryDate'] = d.pop('warranty_expiry_date')
        d['currentHolderId'] = d.pop('current_holder_id')
        d['currentHolderName'] = d.pop('current_holder_name')
        d['currentHolderAvatar'] = d.pop('current_holder_avatar')
        d['expectedReturnDate'] = d.pop('expected_return_date')
        d['createdAt'] = d.pop('created_at')
        assets.append(d)
    conn.close()
    return jsonify(assets)

@app.route('/api/assets/<asset_id>', methods=['GET'])
def get_asset(asset_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM assets WHERE id = ? OR tag = ?', (asset_id, asset_id))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return jsonify({'error': 'Asset not found'}), 404
    d = dict_from_row(row)
    return jsonify(d)

@app.route('/api/assets', methods=['POST'])
def create_asset():
    data = request.get_json() or {}
    conn = get_db()
    cursor = conn.cursor()

    # Generate sequential tag if not passed
    cursor.execute('SELECT COUNT(*) as count FROM assets')
    next_num = cursor.fetchone()['count'] + 1
    tag = data.get('tag') or f"AF-{str(next_num).zfill(4)}"
    asset_id = f"ast-{int(datetime.now().timestamp()*1000)}"
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute('''
    INSERT INTO assets (
        id, tag, name, serial_number, category_id, category_name,
        department_id, department_name, status, condition, cost_tracking,
        location, commission_date, warranty_expiry_date, is_bookable,
        current_holder_id, current_holder_name, expected_return_date, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        asset_id,
        tag,
        data.get('name', 'Untitled Hardware'),
        data.get('serialNumber', ''),
        data.get('categoryId', 'cat-comp'),
        data.get('categoryName', 'Computing Hardware'),
        data.get('departmentId', 'dept-ops'),
        data.get('departmentName', 'Executive & Governance Operations'),
        data.get('status', 'Available'),
        data.get('condition', 'Good'),
        float(data.get('costTracking', 0.0)),
        data.get('location', 'Central Inventory Vault'),
        data.get('commissionDate', datetime.now().strftime("%Y-%m-%d")),
        data.get('warrantyExpiryDate', '2028-01-01'),
        1 if data.get('isBookable') else 0,
        data.get('currentHolderId'),
        data.get('currentHolderName'),
        data.get('expectedReturnDate'),
        created_at
    ))
    conn.commit()
    conn.close()

    record_activity(
        action='ASSET_REGISTERED',
        actor_name=data.get('actorName', 'Admin System'),
        actor_role='admin',
        notes=f"Commissioned {data.get('name')} under tag {tag}",
        asset_id=asset_id,
        asset_tag=tag,
        asset_name=data.get('name'),
        new_state='Available'
    )

    return jsonify({'success': True, 'id': asset_id, 'tag': tag}), 201

@app.route('/api/assets/<asset_id>', methods=['PUT'])
def update_asset(asset_id):
    data = request.get_json() or {}
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM assets WHERE id = ?', (asset_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        return jsonify({'error': 'Asset not found'}), 404

    cursor.execute('''
    UPDATE assets SET
        name = COALESCE(?, name),
        location = COALESCE(?, location),
        condition = COALESCE(?, condition),
        cost_tracking = COALESCE(?, cost_tracking),
        serial_number = COALESCE(?, serial_number),
        category_name = COALESCE(?, category_name),
        department_name = COALESCE(?, department_name),
        status = COALESCE(?, status),
        is_bookable = COALESCE(?, is_bookable)
    WHERE id = ?
    ''', (
        data.get('name'),
        data.get('location'),
        data.get('condition'),
        data.get('costTracking'),
        data.get('serialNumber'),
        data.get('categoryName'),
        data.get('departmentName'),
        data.get('status'),
        1 if data.get('isBookable') else 0 if 'isBookable' in data else None,
        asset_id
    ))
    conn.commit()
    conn.close()

    record_activity(
        action='ASSET_UPDATED',
        actor_name=data.get('actorName', 'Admin System'),
        actor_role='admin',
        notes=f"Updated asset parameters: {', '.join(data.keys())}",
        asset_id=asset_id,
        asset_tag=existing['tag'],
        asset_name=data.get('name', existing['name'])
    )

    return jsonify({'success': True, 'message': 'Asset updated successfully'})

@app.route('/api/assets/<asset_id>', methods=['DELETE'])
def delete_asset(asset_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM assets WHERE id = ?', (asset_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        return jsonify({'error': 'Asset not found'}), 404

    cursor.execute('DELETE FROM assets WHERE id = ?', (asset_id,))
    conn.commit()
    conn.close()

    record_activity(
        action='ASSET_DECOMMISSIONED',
        actor_name='Admin System',
        actor_role='admin',
        notes=f"Permanently removed {existing['tag']} ({existing['name']}) from inventory",
        asset_id=asset_id,
        asset_tag=existing['tag'],
        asset_name=existing['name']
    )

    return jsonify({'success': True, 'message': f"Asset {existing['tag']} decommissioned"})

@app.route('/api/assets/<asset_id>/check-in', methods=['POST'])
def check_in_asset(asset_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM assets WHERE id = ?', (asset_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        return jsonify({'error': 'Asset not found'}), 404

    cursor.execute('''
    UPDATE assets SET
        status = 'Available',
        current_holder_id = NULL,
        current_holder_name = NULL,
        current_holder_avatar = NULL,
        expected_return_date = NULL
    WHERE id = ?
    ''', (asset_id,))
    conn.commit()
    conn.close()

    record_activity(
        action='ASSET_CHECKED_IN',
        actor_name='Custody Admin',
        actor_role='asset_manager',
        notes=f"Checked into vault storage. Status returned to Available.",
        asset_id=asset_id,
        asset_tag=existing['tag'],
        asset_name=existing['name'],
        prev_state='Allocated',
        new_state='Available'
    )

    return jsonify({'success': True, 'status': 'Available'})

# --- TICKETS CRUD ---

@app.route('/api/tickets', methods=['GET'])
def get_tickets():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM maintenance_tickets ORDER BY id DESC')
    rows = cursor.fetchall()
    tickets = []
    for r in rows:
        d = dict_from_row(r)
        d['ticketNumber'] = d.pop('ticket_number')
        d['assetId'] = d.pop('asset_id')
        d['assetTag'] = d.pop('asset_tag')
        d['assetName'] = d.pop('asset_name')
        d['reportedById'] = d.pop('reported_by_id')
        d['reportedByName'] = d.pop('reported_by_name')
        d['issueDescription'] = d.pop('issue_description')
        d['assignedTechnician'] = d.pop('assigned_technician')
        d['createdAt'] = d.pop('created_at')
        tickets.append(d)
    conn.close()
    return jsonify(tickets)

@app.route('/api/tickets', methods=['POST'])
def create_ticket():
    data = request.get_json() or {}
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('SELECT COUNT(*) as count FROM maintenance_tickets')
    num = cursor.fetchone()['count'] + 1051
    ticket_id = f"tkt-{int(datetime.now().timestamp()*1000)}"
    ticket_number = f"TKT-{num}"
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute('''
    INSERT INTO maintenance_tickets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        ticket_id,
        ticket_number,
        data.get('assetId'),
        data.get('assetTag'),
        data.get('assetName'),
        data.get('priority', 'High'),
        'Pending',
        data.get('reportedById', 'usr-emp-1'),
        data.get('reportedByName', 'Employee'),
        data.get('issueDescription', 'Hardware malfunction reported'),
        data.get('assignedTechnician'),
        created_at
    ))

    # Mark asset as Under Maintenance
    cursor.execute("UPDATE assets SET status = 'Under Maintenance' WHERE id = ?", (data.get('assetId'),))

    conn.commit()
    conn.close()

    return jsonify({'success': True, 'ticketNumber': ticket_number, 'id': ticket_id}), 201

# --- BOOKINGS CRUD WITH OVERLAP VALIDATION ---

@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM resource_bookings ORDER BY date DESC, start_time ASC')
    rows = cursor.fetchall()
    bookings = []
    for r in rows:
        d = dict_from_row(r)
        d['resourceId'] = d.pop('resource_id')
        d['resourceName'] = d.pop('resource_name')
        d['startTime'] = d.pop('start_time')
        d['endTime'] = d.pop('end_time')
        d['bookedByUserId'] = d.pop('booked_by_user_id')
        d['bookedByUserName'] = d.pop('booked_by_user_name')
        d['createdAt'] = d.pop('created_at')
        bookings.append(d)
    conn.close()
    return jsonify(bookings)

@app.route('/api/bookings', methods=['POST'])
def create_booking():
    data = request.get_json() or {}
    conn = get_db()
    cursor = conn.cursor()

    # Overlap / Conflict Blocker check
    cursor.execute('''
    SELECT * FROM resource_bookings
    WHERE resource_id = ? AND date = ? AND status != 'Cancelled'
    AND (start_time < ? AND end_time > ?)
    ''', (data.get('resourceId'), data.get('date'), data.get('endTime'), data.get('startTime')))
    collision = cursor.fetchone()

    if collision:
        conn.close()
        return jsonify({
            'success': False,
            'error': f"Collision detected! Slot already reserved by {collision['booked_by_user_name']} ({collision['start_time']} - {collision['end_time']})."
        }), 409

    booking_id = f"bkg-{int(datetime.now().timestamp()*1000)}"
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute('''
    INSERT INTO resource_bookings VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        booking_id,
        data.get('resourceId'),
        data.get('resourceName'),
        data.get('date'),
        data.get('startTime'),
        data.get('endTime'),
        data.get('purpose'),
        data.get('bookedByUserId', 'usr-emp-1'),
        data.get('bookedByUserName', 'Employee'),
        'Active',
        created_at
    ))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'id': booking_id}), 201

# --- DEPARTMENTS & ACTIVITY LOGS ---

@app.route('/api/departments', methods=['GET'])
def get_departments():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM departments')
    rows = cursor.fetchall()
    depts = [dict_from_row(r) for r in rows]
    conn.close()
    return jsonify(depts)

@app.route('/api/activity-logs', methods=['GET'])
def get_activity_logs():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 50')
    rows = cursor.fetchall()
    logs = [dict_from_row(r) for r in rows]
    conn.close()
    return jsonify(logs)

# --- DATABASE RESET / SEED ---

@app.route('/api/reset-db', methods=['POST'])
def reset_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DROP TABLE IF EXISTS assets')
    cursor.execute('DROP TABLE IF EXISTS departments')
    cursor.execute('DROP TABLE IF EXISTS categories')
    cursor.execute('DROP TABLE IF EXISTS maintenance_tickets')
    cursor.execute('DROP TABLE IF EXISTS resource_bookings')
    cursor.execute('DROP TABLE IF EXISTS transfer_requests')
    cursor.execute('DROP TABLE IF EXISTS activity_logs')
    conn.commit()
    conn.close()

    init_db(seed=True)
    return jsonify({'success': True, 'message': 'Database re-initialized and seeded with default ERP ledger.'})

@app.route('/api/clear-db', methods=['POST'])
def clear_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM assets')
    cursor.execute('DELETE FROM maintenance_tickets')
    cursor.execute('DELETE FROM resource_bookings')
    cursor.execute('DELETE FROM transfer_requests')
    cursor.execute('DELETE FROM activity_logs')
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'All tables cleared. Clean zero-state database.'})

if __name__ == '__main__':
    # Initialize DB schema on launch
    init_db(seed=True)
    print("🚀 AssetFlow Flask Backend Server running at http://localhost:5001")
    print("📋 API Documentation available at http://localhost:5001/api/health")
    app.run(host='0.0.0.0', port=5001, debug=False)
