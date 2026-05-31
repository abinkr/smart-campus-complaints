// src/data/mockComplaintLogs.js
// Mutable map: complaintId → array of history log entries.
// mockApi.js appends new entries when updateMockComplaint is called.

export let mockComplaintLogs = {
  // c0001 — Burst pipe (currently IN_PROGRESS)
  'c1a2b3c4-0001-4d5e-8f6a-7b8c9d0e1f2a': [
    {
      oldStatus: 'OPEN',
      newStatus: 'IN_PROGRESS',
      changedBy: 'Admin Sarah Thomas',
      note: 'Maintenance team dispatched. Temporary shutoff valve applied.',
      changedAt: '2026-05-28T09:30:00.000Z'
    }
  ],

  // c0002 — Electrical short circuit (OPEN — no log entries yet)
  'c1a2b3c4-0002-4d5e-8f6a-7b8c9d0e1f2b': [],

  // c0003 — Wi-Fi dead zone (OPEN — no log entries yet)
  'c1a2b3c4-0003-4d5e-8f6a-7b8c9d0e1f2c': [],

  // c0004 — Overflowing dustbins (RESOLVED)
  'c1a2b3c4-0004-4d5e-8f6a-7b8c9d0e1f2d': [
    {
      oldStatus: 'OPEN',
      newStatus: 'IN_PROGRESS',
      changedBy: 'Admin James Rodrigues',
      note: 'Cleaning staff alerted. Bins scheduled for clearance today.',
      changedAt: '2026-05-25T14:15:00.000Z'
    },
    {
      oldStatus: 'IN_PROGRESS',
      newStatus: 'RESOLVED',
      changedBy: 'Admin James Rodrigues',
      note: 'Bins cleared and disinfected. Collection frequency increased to twice daily.',
      changedAt: '2026-05-25T17:00:00.000Z'
    }
  ],

  // c0005 — Broken projector (IN_PROGRESS)
  'c1a2b3c4-0005-4d5e-8f6a-7b8c9d0e1f2e': [
    {
      oldStatus: 'OPEN',
      newStatus: 'IN_PROGRESS',
      changedBy: 'Admin Sarah Thomas',
      note: 'Replacement lamp ordered. Temporary portable projector arranged from AV store.',
      changedAt: '2026-05-30T11:00:00.000Z'
    }
  ],

  // c0006 — Scholarship portal (RESOLVED)
  'c1a2b3c4-0006-4d5e-8f6a-7b8c9d0e1f2f': [
    {
      oldStatus: 'OPEN',
      newStatus: 'IN_PROGRESS',
      changedBy: 'Admin Dev Nair',
      note: 'IT team investigating database connection issue. Portal temporarily suspended.',
      changedAt: '2026-05-22T11:45:00.000Z'
    },
    {
      oldStatus: 'IN_PROGRESS',
      newStatus: 'RESOLVED',
      changedBy: 'Admin Dev Nair',
      note: 'Connection pool exhaustion fixed. Portal restored. Deadline extended 48 hours.',
      changedAt: '2026-05-22T14:30:00.000Z'
    }
  ],

  // c0007 — Broken benches (OPEN — no log entries yet)
  'c1a2b3c4-0007-4d5e-8f6a-7b8c9d0e1f30': [],

  // c0008 — AC not working (IN_PROGRESS)
  'c1a2b3c4-0008-4d5e-8f6a-7b8c9d0e1f31': [
    {
      oldStatus: 'OPEN',
      newStatus: 'IN_PROGRESS',
      changedBy: 'Admin Preethi Anand',
      note: 'HVAC technician booked for inspection. Assigned to Electrical department.',
      changedAt: '2026-05-28T16:00:00.000Z'
    }
  ],

  // c0009 — Blocked drain (OPEN — no log entries yet)
  'c1a2b3c4-0009-4d5e-8f6a-7b8c9d0e1f32': [],

  // c0010 — Exam hall allocation (RESOLVED)
  'c1a2b3c4-0010-4d5e-8f6a-7b8c9d0e1f33': [
    {
      oldStatus: 'OPEN',
      newStatus: 'IN_PROGRESS',
      changedBy: 'Admin Sarah Thomas',
      note: 'Escalated to Examination Cell. Requesting updated hall allocation data.',
      changedAt: '2026-05-20T09:00:00.000Z'
    },
    {
      oldStatus: 'IN_PROGRESS',
      newStatus: 'RESOLVED',
      changedBy: 'Admin Sarah Thomas',
      note: 'Exam hall data updated. Students notified via WhatsApp and email.',
      changedAt: '2026-05-20T12:00:00.000Z'
    }
  ],

  // c0011 — Library RFID gate (IN_PROGRESS)
  'c1a2b3c4-0011-4d5e-8f6a-7b8c9d0e1f34': [
    {
      oldStatus: 'OPEN',
      newStatus: 'IN_PROGRESS',
      changedBy: 'Admin Dev Nair',
      note: 'IT team investigating RFID antenna calibration. Manual bag-check instituted.',
      changedAt: '2026-05-26T11:30:00.000Z'
    }
  ],

  // c0012 — Mould growth (OPEN — no log entries yet)
  'c1a2b3c4-0012-4d5e-8f6a-7b8c9d0e1f35': [],

  // c0013 — Cafeteria food quality (IN_PROGRESS)
  'c1a2b3c4-0013-4d5e-8f6a-7b8c9d0e1f36': [
    {
      oldStatus: 'OPEN',
      newStatus: 'IN_PROGRESS',
      changedBy: 'Admin Preethi Anand',
      note: 'Formal notice issued to cafeteria vendor. H&S committee inspection scheduled.',
      changedAt: '2026-05-29T14:00:00.000Z'
    }
  ],

  // c0014 — Flickering lights (RESOLVED)
  'c1a2b3c4-0014-4d5e-8f6a-7b8c9d0e1f37': [
    {
      oldStatus: 'OPEN',
      newStatus: 'IN_PROGRESS',
      changedBy: 'Admin James Rodrigues',
      note: 'Electrician assigned. Stairwell flagged for urgent inspection.',
      changedAt: '2026-05-19T08:00:00.000Z'
    },
    {
      oldStatus: 'IN_PROGRESS',
      newStatus: 'RESOLVED',
      changedBy: 'Admin James Rodrigues',
      note: 'Replaced 6 fluorescent starters and 2 tube lights. Stairwell confirmed fully lit.',
      changedAt: '2026-05-19T15:30:00.000Z'
    }
  ],

  // c0015 — Printer out of toner (RESOLVED)
  'c1a2b3c4-0015-4d5e-8f6a-7b8c9d0e1f38': [
    {
      oldStatus: 'OPEN',
      newStatus: 'IN_PROGRESS',
      changedBy: 'Admin Dev Nair',
      note: 'Toner cartridge requisition raised with stores.',
      changedAt: '2026-05-23T14:00:00.000Z'
    },
    {
      oldStatus: 'IN_PROGRESS',
      newStatus: 'RESOLVED',
      changedBy: 'Admin Dev Nair',
      note: 'New toner cartridge installed and tested. Printer operational.',
      changedAt: '2026-05-24T09:30:00.000Z'
    }
  ],

  // c0016 — Broken water cooler (IN_PROGRESS)
  'c1a2b3c4-0016-4d5e-8f6a-7b8c9d0e1f39': [
    {
      oldStatus: 'OPEN',
      newStatus: 'IN_PROGRESS',
      changedBy: 'Admin Preethi Anand',
      note: 'Compressor failure confirmed. Replacement unit on order. Dispensers arranged.',
      changedAt: '2026-05-26T17:00:00.000Z'
    }
  ],

  // c0017 — Whiteboard surfaces peeling (OPEN — no log entries yet)
  'c1a2b3c4-0017-4d5e-8f6a-7b8c9d0e1f40': [],

  // c0018 — Graffiti (RESOLVED)
  'c1a2b3c4-0018-4d5e-8f6a-7b8c9d0e1f41': [
    {
      oldStatus: 'OPEN',
      newStatus: 'IN_PROGRESS',
      changedBy: 'Admin James Rodrigues',
      note: 'Cleaning team deployed. Chemical solvent sourced for graffiti removal.',
      changedAt: '2026-05-19T09:30:00.000Z'
    },
    {
      oldStatus: 'IN_PROGRESS',
      newStatus: 'RESOLVED',
      changedBy: 'Admin James Rodrigues',
      note: 'Graffiti removed. Wall re-painted. CCTV footage reviewed.',
      changedAt: '2026-05-19T16:00:00.000Z'
    }
  ],

  // c0019 — Student ID not issued (OPEN — no log entries yet)
  'c1a2b3c4-0019-4d5e-8f6a-7b8c9d0e1f42': [],

  // c0020 — Pothole near Parking Lot B (OPEN — no log entries yet)
  'c1a2b3c4-0020-4d5e-8f6a-7b8c9d0e1f43': []
};
