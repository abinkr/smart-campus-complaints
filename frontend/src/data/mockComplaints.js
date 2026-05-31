// src/data/mockComplaints.js
// Mutable — mockApi.js mutates this array to simulate updates.

export let mockComplaints = [
  {
    id: 'c1a2b3c4-0001-4d5e-8f6a-7b8c9d0e1f2a',
    title: 'Burst pipe flooding men\'s washroom (Block A)',
    description:
      'A pipe has burst in the Block A ground floor men\'s washroom. Water is pooling on the floor and spreading into the corridor. Three cubicles are unusable. Students are being redirected to Block C.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
    category: 'Plumbing',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    department: 'Plumbing',
    adminNote: 'Maintenance team dispatched. Temporary shutoff valve applied. Repairs estimated 4 hours.',
    createdAt: '2026-05-28T07:14:00.000Z',
    user: { name: 'Arjun Mehta', email: 'arjun.mehta@student.edu' }
  },
  {
    id: 'c1a2b3c4-0002-4d5e-8f6a-7b8c9d0e1f2b',
    title: 'Electrical short circuit in Lab 204',
    description:
      'The power outlet near the server rack in Lab 204 sparked and tripped the circuit breaker. Three desktop workstations lost power mid-session. The breaker has been reset but the outlet still smells of burnt plastic.',
    imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop',
    category: 'Electrical',
    priority: 'HIGH',
    status: 'OPEN',
    department: 'Electrical',
    adminNote: '',
    createdAt: '2026-05-30T09:45:00.000Z',
    user: { name: 'Priya Sharma', email: 'priya.sharma@student.edu' }
  },
  {
    id: 'c1a2b3c4-0003-4d5e-8f6a-7b8c9d0e1f2c',
    title: 'Campus Wi-Fi dead zone — entire Hostel Block D',
    description:
      'Wi-Fi has been completely unavailable in Hostel Block D since Monday morning. Approximately 120 residents are affected. The access point on the second floor appears to have a blinking red status light.',
    imageUrl: null,
    category: 'IT',
    priority: 'HIGH',
    status: 'OPEN',
    department: 'IT Support',
    adminNote: '',
    createdAt: '2026-05-29T06:30:00.000Z',
    user: { name: 'Sneha Reddy', email: 'sneha.reddy@student.edu' }
  },
  {
    id: 'c1a2b3c4-0004-4d5e-8f6a-7b8c9d0e1f2d',
    title: 'Overflowing dustbins outside Cafeteria',
    description:
      'The three dustbins placed at the cafeteria entrance have been overflowing since yesterday afternoon. Garbage is spilling onto the walkway. There is a noticeable odour and flies are visible.',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop',
    category: 'Cleaning',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    department: 'Cleaning',
    adminNote: 'Bins cleared and disinfected. Increased collection frequency to twice daily.',
    createdAt: '2026-05-25T13:00:00.000Z',
    user: { name: 'Rohit Kumar', email: 'rohit.kumar@student.edu' }
  },
  {
    id: 'c1a2b3c4-0005-4d5e-8f6a-7b8c9d0e1f2e',
    title: 'Broken projector in Lecture Hall 3',
    description:
      'The ceiling-mounted projector in Lecture Hall 3 stopped working during a morning lecture. The lamp indicator light is amber. Professors are unable to display slides for approximately 80 students.',
    imageUrl: null,
    category: 'Maintenance',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    department: 'Maintenance',
    adminNote: 'Replacement lamp ordered. Temporary portable projector arranged from Audio-Visual store.',
    createdAt: '2026-05-30T10:15:00.000Z',
    user: { name: 'Kavya Nair', email: 'kavya.nair@student.edu' }
  },
  {
    id: 'c1a2b3c4-0006-4d5e-8f6a-7b8c9d0e1f2f',
    title: 'Scholarship portal login failure',
    description:
      'Multiple students are unable to log into the scholarship application portal. The page loads but the submit button triggers a 500 error. The deadline for scholarship applications is in two days.',
    imageUrl: null,
    category: 'IT',
    priority: 'HIGH',
    status: 'RESOLVED',
    department: 'IT Support',
    adminNote: 'Database connection pool exhaustion fixed. Portal restored. Deadline extended by 48 hours as compensatory measure.',
    createdAt: '2026-05-22T11:00:00.000Z',
    user: { name: 'Aditya Verma', email: 'aditya.verma@student.edu' }
  },
  {
    id: 'c1a2b3c4-0007-4d5e-8f6a-7b8c9d0e1f30',
    title: 'Broken benches in Central Garden',
    description:
      'Four of the twelve wooden benches in the central garden have broken planks. Two of them are completely unusable and pose a safety risk. Students have been seen sitting on rough edges.',
    imageUrl: 'https://images.unsplash.com/photo-1558618047-f4e073b64c58?w=800&auto=format&fit=crop',
    category: 'Maintenance',
    priority: 'LOW',
    status: 'OPEN',
    department: 'Maintenance',
    adminNote: '',
    createdAt: '2026-05-27T15:20:00.000Z',
    user: { name: 'Meera Joshi', email: 'meera.joshi@student.edu' }
  },
  {
    id: 'c1a2b3c4-0008-4d5e-8f6a-7b8c9d0e1f31',
    title: 'AC not working in Reading Room 1',
    description:
      'The air conditioning unit in Reading Room 1 has been non-functional for three days. Indoor temperature reaches 36°C in the afternoon. Approximately 40 students use this room daily for examination preparation.',
    imageUrl: null,
    category: 'Electrical',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    department: 'Electrical',
    adminNote: 'HVAC technician inspected. Refrigerant top-up scheduled for tomorrow morning.',
    createdAt: '2026-05-28T14:30:00.000Z',
    user: { name: 'Vikram Patel', email: 'vikram.patel@student.edu' }
  },
  {
    id: 'c1a2b3c4-0009-4d5e-8f6a-7b8c9d0e1f32',
    title: 'Blocked drain in Girls\' Hostel Block B — 3rd Floor',
    description:
      'The bathroom drain on the third floor of Block B is completely blocked. Water stagnates after every use. The issue was reported verbally two weeks ago but has not been fixed. The smell is unbearable.',
    imageUrl: null,
    category: 'Plumbing',
    priority: 'HIGH',
    status: 'OPEN',
    department: 'Plumbing',
    adminNote: '',
    createdAt: '2026-05-29T19:00:00.000Z',
    user: { name: 'Ananya Singh', email: 'ananya.singh@student.edu' }
  },
  {
    id: 'c1a2b3c4-0010-4d5e-8f6a-7b8c9d0e1f33',
    title: 'Exam hall allocation not updated on portal',
    description:
      'The exam hall allocation published on the student portal shows last semester\'s data. Students have been reporting to wrong rooms. The end-semester exams begin in 48 hours.',
    imageUrl: null,
    category: 'Administration',
    priority: 'HIGH',
    status: 'RESOLVED',
    department: 'Administration',
    adminNote: 'Exam hall data updated by the Examination Cell. Students notified via official WhatsApp channel and email.',
    createdAt: '2026-05-20T08:00:00.000Z',
    user: { name: 'Deepak Raj', email: 'deepak.raj@student.edu' }
  },
  {
    id: 'c1a2b3c4-0011-4d5e-8f6a-7b8c9d0e1f34',
    title: 'Library RFID gate malfunctioning',
    description:
      'The RFID security gate at the library entrance is beeping continuously even for students who have not borrowed any books. The noise is disrupting study. The gate has also failed to detect one actual book theft attempt.',
    imageUrl: null,
    category: 'IT',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    department: 'IT Support',
    adminNote: 'IT team investigating antenna calibration. Temporary manual bag-check in place.',
    createdAt: '2026-05-26T10:00:00.000Z',
    user: { name: 'Pooja Iyer', email: 'pooja.iyer@student.edu' }
  },
  {
    id: 'c1a2b3c4-0012-4d5e-8f6a-7b8c9d0e1f35',
    title: 'Mould growth on classroom ceiling — Room 112',
    description:
      'Extensive black mould is visible on the ceiling of Room 112 near the window. Students have raised health concerns. The mould appears to be spreading due to a leaking roof above.',
    imageUrl: 'https://images.unsplash.com/photo-1617952385804-7b326fa42079?w=800&auto=format&fit=crop',
    category: 'Maintenance',
    priority: 'MEDIUM',
    status: 'OPEN',
    department: 'Maintenance',
    adminNote: '',
    createdAt: '2026-05-27T11:45:00.000Z',
    user: { name: 'Siddharth Gupta', email: 'siddharth.gupta@student.edu' }
  },
  {
    id: 'c1a2b3c4-0013-4d5e-8f6a-7b8c9d0e1f36',
    title: 'Cafeteria food quality — foreign objects found',
    description:
      'Two students found plastic fragments in their meals on consecutive days. Food quality has noticeably declined this semester. This raises serious food safety concerns that need immediate administrative review.',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop',
    category: 'Administration',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    department: 'Administration',
    adminNote: 'Cafeteria vendor issued formal notice. Health & Safety committee inspection scheduled for next Monday.',
    createdAt: '2026-05-29T12:30:00.000Z',
    user: { name: 'Riya Kapoor', email: 'riya.kapoor@student.edu' }
  },
  {
    id: 'c1a2b3c4-0014-4d5e-8f6a-7b8c9d0e1f37',
    title: 'Flickering lights in stairwell — Block C',
    description:
      'The fluorescent tube lights in the Block C stairwell have been flickering for two weeks. The stairwell is poorly lit at night and students have expressed safety concerns when using it after 7 PM.',
    imageUrl: null,
    category: 'Electrical',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    department: 'Electrical',
    adminNote: 'Replaced 6 fluorescent starters and 2 tube lights. Stairwell confirmed fully lit.',
    createdAt: '2026-05-18T20:00:00.000Z',
    user: { name: 'Harsh Mishra', email: 'harsh.mishra@student.edu' }
  },
  {
    id: 'c1a2b3c4-0015-4d5e-8f6a-7b8c9d0e1f38',
    title: 'Printer in Computer Lab 1 out of toner',
    description:
      'The shared laser printer in Computer Lab 1 has been out of toner since last Friday. Students need to print their project reports due next week. The lab assistant has been asked but no replacement has arrived.',
    imageUrl: null,
    category: 'IT',
    priority: 'LOW',
    status: 'RESOLVED',
    department: 'IT Support',
    adminNote: 'New toner cartridge installed. Printer tested and operational.',
    createdAt: '2026-05-23T13:00:00.000Z',
    user: { name: 'Nalini Das', email: 'nalini.das@student.edu' }
  },
  {
    id: 'c1a2b3c4-0016-4d5e-8f6a-7b8c9d0e1f39',
    title: 'Broken water cooler — Sports Complex',
    description:
      'The only water cooler at the sports complex entrance has not been working for five days. Students practicing in the afternoon heat are forced to go to the main building for water. This is a health risk.',
    imageUrl: null,
    category: 'Plumbing',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    department: 'Plumbing',
    adminNote: 'Compressor unit failure confirmed. Replacement unit on order. Temporary water dispensers arranged.',
    createdAt: '2026-05-26T16:00:00.000Z',
    user: { name: 'Suresh Rao', email: 'suresh.rao@student.edu' }
  },
  {
    id: 'c1a2b3c4-0017-4d5e-8f6a-7b8c9d0e1f40',
    title: 'Classroom whiteboard surfaces peeling',
    description:
      'The whiteboard surfaces in Rooms 305, 306, and 307 are peeling and warped. Dry-erase markers smear across the peeled sections. Professors cannot write clearly. Standard whiteboards need replacement.',
    imageUrl: null,
    category: 'Maintenance',
    priority: 'LOW',
    status: 'OPEN',
    department: 'Maintenance',
    adminNote: '',
    createdAt: '2026-05-24T09:00:00.000Z',
    user: { name: 'Ramesh Nair', email: 'ramesh.nair@student.edu' }
  },
  {
    id: 'c1a2b3c4-0018-4d5e-8f6a-7b8c9d0e1f41',
    title: 'Graffiti on campus boundary wall',
    description:
      'Offensive graffiti has been spray-painted on the campus boundary wall near the main gate over the weekend. It is clearly visible to visitors and parents entering campus.',
    imageUrl: 'https://images.unsplash.com/photo-1533327325824-76851f166365?w=800&auto=format&fit=crop',
    category: 'Cleaning',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    department: 'Cleaning',
    adminNote: 'Graffiti removed using chemical solvent. Wall re-painted. CCTV footage reviewed for investigation.',
    createdAt: '2026-05-19T08:30:00.000Z',
    user: { name: 'Farida Khan', email: 'farida.khan@student.edu' }
  },
  {
    id: 'c1a2b3c4-0019-4d5e-8f6a-7b8c9d0e1f42',
    title: 'Student ID card not issued after 3 weeks',
    description:
      'I submitted my ID card application with all documents at the administration office three weeks ago. I have still not received my card and cannot access the library, hostel, or attend exams without it.',
    imageUrl: null,
    category: 'Administration',
    priority: 'MEDIUM',
    status: 'OPEN',
    department: 'Administration',
    adminNote: '',
    createdAt: '2026-05-28T10:00:00.000Z',
    user: { name: 'Tanya Bose', email: 'tanya.bose@student.edu' }
  },
  {
    id: 'c1a2b3c4-0020-4d5e-8f6a-7b8c9d0e1f43',
    title: 'Pothole near Parking Lot B is dangerous',
    description:
      'A large pothole near the entrance of Parking Lot B has been growing for weeks. Two students have already had minor cycle accidents. After the last rainfall it collected water and is very difficult to see at night.',
    imageUrl: null,
    category: 'Other',
    priority: 'MEDIUM',
    status: 'OPEN',
    department: 'Maintenance',
    adminNote: '',
    createdAt: '2026-05-30T07:00:00.000Z',
    user: { name: 'Nikhil Jain', email: 'nikhil.jain@student.edu' }
  }
];
