# Sales Record System (SRS)

A secure, offline-capable desktop bookkeeping application for managing sales, expenses, debtors, and financial reports. Built with Electron, React, TypeScript, and Vite.

## Features

✅ **Sales Management** - Track product sales with payment methods (Cash/AzamPesa)  
✅ **Expense Tracking** - Record business expenses by category  
✅ **Debtor Registry** - Manage credit customers with phone validation (Tanzania)  
✅ **Item Tracking** - Record what items were borrowed per debtor  
✅ **Payment History** - Track all debtor payments with dates  
✅ **Financial Reports** - Monthly summaries and P&L  
✅ **User Management** - Admin & Saler roles with PIN auth  
✅ **Auto-Update** - Electron-updater from GitHub Releases  
✅ **Offline Ready** - All data in localStorage  
✅ **Security** - CSP headers, sandboxed preload API  
✅ **Data Export/Reset** - Backup or clear data  

## Quick Start

### Windows Users

1. **Download & Install**
   - Visit: https://github.com/omarmirajiomar-cmyk/Sales_Record_System_Project/releases
   - Download `SalesRecordSystem.exe`
   - Double-click to install

2. **First Time**
   - Log in as Admin (empty PIN)
   - Set your PIN
   - Create Saler account
   - Done!

### Developers

Prerequisites: Node.js 18+

```bash
cd "Sales Record"
npm install
npm run electron:dev
```

## Building

```bash
# Create installer
npm run electron:build

# Or Windows-specific
npm run electron:dist
```

## Usage

### Debtors
- Add customer: name, phone (07XXXXXXXX format), **item borrowed**, amount
- Track payments
- View history
- Auto status: Unpaid → Partially Paid → Paid

### Tanzania Phone Numbers
Accepted: `07XXXXXXXX` or `+2557XXXXXXXX`  
Stored as: `+2557XXXXXXXX`

### Diagnostics (Support Menu)
- Check Updates
- Install Update
- Export Database (JSON)
- Reset Data

## Auto-Update

App checks for updates on startup. If newer version found:
1. Downloads `.exe` and `.blockmap`
2. Prompts user to install
3. Auto-restarts with new version

Updates from: https://github.com/omarmirajiomar-cmyk/Sales_Record_System_Project/releases

## Security Notes

### 🔐 Revoke Exposed PATs

If GitHub tokens were posted online:

1. **Revoke Now**: https://github.com/settings/tokens (Delete any SRS tokens)

2. **Create New Token**:
   - Go: https://github.com/settings/tokens/new
   - Scopes: ✅ `repo` + ✅ `workflow`
   - Copy immediately

3. **Add to Repo Secrets**:
   - Settings → Secrets and variables → Actions
   - New secret: `GH_TOKEN` = (your token)

### Architecture
- **Offline** - No internet required
- **CSP Headers** - Restrict script sources
- **Preload Sandboxing** - Minimal main-process API
- **Input Validation** - Phone format checks
- **No External APIs** - No cloud dependencies

## Project Structure

```
.
├── components/          # React components
│   ├── DebtorsModule.tsx   # Debtor + item tracking
│   ├── SalesModule.tsx     # Sales CRUD
│   ├── Diagnostics.tsx     # Recovery tools
│   └── ...
├── services/            # Business logic
│   ├── db.ts               # localStorage wrapper
│   ├── validation.ts       # Tanzania phone validation
├── main.js              # Electron main process
├── preload.js           # Secure IPC
├── types.ts             # TypeScript types
└── .github/workflows/   # GitHub Actions
    └── release.yml         # Auto-build & publish
```

## Technologies

- **Electron** 29.1.0 - Desktop app
- **React** 18.2.0 - UI
- **TypeScript** 5.2.2 - Type safety
- **Vite** 5.4.21 - Build tool
- **electron-builder** 24.13.3 - Packaging
- **electron-updater** 6.6.2 - Auto-updates
- **Tailwind CSS** - Styling (CDN)

## Scripts

```bash
npm run dev              # Vite dev server
npm run build            # TypeScript + Vite build
npm run electron:dev     # Vite + Electron together
npm run electron:build   # Build installer (no publish)
npm run electron:dist    # Windows installer
npm run publish:github   # Build + publish to GitHub (requires GH_TOKEN)
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Module not found | `npm install` |
| sharp build error | `npm rebuild sharp --verbose` |
| App won't update | Check Support → Check Updates; verify release .exe exists |
| Phone validation | Format: `07XXXXXXXX` or `+2557XXXXXXXX` exactly |

## Release Notes

**v1.0.0** (2025-12-12)
- Initial release
- Sales, Expense, Debtor modules
- Auto-update infrastructure
- Tanzania phone validation
- Item tracking per debtor (NEW)

## Links

- **Repository**: https://github.com/omarmirajiomar-cmyk/Sales_Record_System_Project
- **Releases**: https://github.com/omarmirajiomar-cmyk/Sales_Record_System_Project/releases
- **Issues**: https://github.com/omarmirajiomar-cmyk/Sales_Record_System_Project/issues

---

**Status**: Stable, Offline-Ready  
**Created**: 2025-12-12  
**For**: Tanzania Bookkeeping
