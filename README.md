# Alpha Fleet Board (Pirate Ship) 🏴‍☠️

A modern, minimalist student accountability dashboard for Alpha Afterschool program.

## Quick Start

**Easy way (recommended):**
```bash
cd /Users/austinway/Desktop/JebinProject
./start.sh
```

**Manual way:**
```bash
cd /Users/austinway/Desktop/JebinProject
node server.js
```

**Access the app:** http://localhost:7000

**✅ Admin Mode is ENABLED by default** - You can start editing immediately!

## Features

### ✨ Modern UI
- Clean, minimalist design with subtle borders and soft colors
- Responsive layout (mobile-friendly)
- High contrast for projector visibility
- Smooth animations and transitions

### 👥 Student Management
- **Add Students**: Click "+ Add Student" button (Admin mode required)
- **Delete Students**: Open student details and click "Delete Student"
- **Edit Notes**: Click any student card to open details drawer
- **Search**: Real-time search by name
- **Filter**: By status (Active/Pirate Ship) or urgency (≤3 days)

### 🎯 Two View Modes

#### Board View (Kanban)
- Drag-and-drop in Admin mode
- Visual countdown badges with color coding:
  - Yellow: >7 days remaining
  - Orange: ≤7 days remaining  
  - Red (pulsing): ≤3 days remaining

#### Table View
- Spreadsheet-style layout
- Bulk actions: Select multiple students
  - Move to Pirate Ship
  - Release to Active
  - Extend +7 or +14 days

### 🔒 Admin Mode
- **ENABLED BY DEFAULT** - Start editing immediately!
- Drag students between Active ↔ Pirate Ship
- Automatic 14-day Pirate Ship period
- Full audit trail of all changes
- Toggle off if you want read-only view

### 📊 Data Features
- **Auto-save**: All changes saved to localStorage automatically
- **Auto-release**: Students auto-release when Pirate Ship period ends
- **Export CSV**: Download current view as spreadsheet
- **Audit Log**: Complete history of all student changes
- **Undo**: 10-second undo window after moves

### ⚡ Quick Actions (in Detail Drawer)
- Extend +7 days
- Release now
- Set custom end date
- Edit notes
- Delete student
- View recent history

## Data Structure

Students are stored with:
- `id`: Unique identifier
- `full_name`: Student name
- `status`: "Active" or "PirateShip"
- `pirate_start`: ISO date when placed in Pirate Ship
- `pirate_end`: ISO date when they should be released (start + 14 days)
- `notes`: Optional notes
- `last_updated_by`: Who made the last change
- `last_updated_at`: When the last change was made

## Persistence

All data is automatically saved to **`data.json`** in the project folder:
- Real-time saving on every change
- Persistent across browser sessions
- Human-readable JSON format
- Fallback to localStorage if server is unavailable

**Location**: `/Users/austinway/Desktop/JebinProject/data.json`

You can backup this file or edit it directly with any text editor!

## Controls

### Filters
- 🔍 **Search**: Type to filter by name
- **Status**: Show Active, Pirate Ship, or All
- **≤3 days**: Show only urgent (≤3 days remaining)

### Admin Actions
- Enable Admin Mode to:
  - Drag students between columns
  - Add new students
  - Delete students
  - Edit all fields

## Technical Details

- **Pure vanilla JavaScript** - No frameworks
- **Node.js custom server** with JSON file persistence
- **data.json** for automatic saving
- **HTML5 Drag & Drop API**
- **Responsive CSS Grid**
- **Fallback to localStorage** if server unavailable

## Browser Support

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

## Tips

1. **Admin Mode is ON by default** - Start making changes right away!
2. **Click any card** to see full student details and history
3. **Use filters** to focus on specific groups
4. **All changes auto-save** to data.json immediately
5. **Watch countdown badges** - colors change at 7 and 3 days
6. **10-second undo** available after moving students
7. **Backup data.json** regularly for safety

## Automation

- Auto-release check runs every 60 seconds
- Students past their `pirate_end` date are automatically released
- All auto-releases are logged to audit trail

## How to Run

1. **Start the server:**
   ```bash
   cd /Users/austinway/Desktop/JebinProject
   node server.js
   ```

2. **Open your browser:** http://localhost:7000

3. **Start using it!** Admin Mode is already enabled - add, edit, delete students immediately.

## Data File Location

All your data is saved in:
```
/Users/austinway/Desktop/JebinProject/data.json
```

You can:
- View it in any text editor
- Back it up by copying the file
- Restore by replacing the file
- Edit it manually if needed (valid JSON required)

---

**Version**: 2.0  
**Updated**: November 2025  
**Server**: Node.js on http://localhost:7000  
**Data**: Persistent JSON file storage

