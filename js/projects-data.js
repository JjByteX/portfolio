/* ─── PROJECTS-DATA.JS ───────────────────────────────────
   Single source for the Projects section (rows, grid, overlay).
   kind: 'featured' = row with cover, 'grid' = compact card.
   Content comes from the CV and the previous project cards.
──────────────────────────────────────────────────────── */
window.PROJECTS = [
  {
    id: 'liquor-inventory', kind: 'featured', title: 'Liquor Inventory Solution',
    summary: 'A rebuild of a legacy PHP inventory system for liquor and F&B cost control, supporting 7 venues and 16 locations.',
    overview: 'Web and Electron desktop apps that work online or offline and sync two ways.',
    role: 'Full Stack Developer, June 2026 – November 2026',
    services: ['Legacy system rebuild', 'Full stack development', 'Offline-first desktop app', 'Audit and reporting'],
    stack: ['React', 'Hono', 'Prisma', 'Electron'],
    about: [
      'The client ran liquor and F&B cost control on a legacy PHP inventory system. I rebuilt it in React, Hono, and Prisma, covering 7 venues and 16 locations.',
      'The new system adds audit reconciliation, variance reports, subscription access, and a tamper-evident activity log. It ships as a web app and an Electron desktop app that work online or offline and sync two ways.'
    ],
    results: ['7 venues and 16 locations supported', 'Audit reconciliation and variance reports', 'Tamper-evident activity log', 'Web and Electron apps that sync both ways, online or offline'],
    link: { label: 'Visit live site', url: 'https://barandkitchencontrol.com' },
    images: ['assets/images/projects/liquor-inventory.png','assets/images/projects/liquor-inventory-2.png','assets/images/projects/liquor-inventory-3.png','assets/images/projects/liquor-inventory-4.png','assets/images/projects/liquor-inventory-5.png']
  },
  {
    id: 'one-shared-services', kind: 'featured', title: 'One Shared Services',
    summary: 'An internal operations platform for facility booking and shared services across the Every Nation buildings in BGC.',
    overview: 'One directory for Finance, HR, Facilities, Communications, WeServe, and Purchasing, with statistics and export reports for every department.',
    role: 'Frontend Developer, May 2026 – September 2026',
    services: ['Admin console screens', 'Shared layout and sidebar', 'Workflow improvements'],
    stack: ['Laravel 12', 'Blade', 'Livewire', 'SQLite', 'Laravel Reverb'],
    about: [
      'Built for Victory BGC. Shuttle requests and room bookings across multiple buildings used to be a manual back-and-forth in chat. They now run through one system.',
      'I delivered 10+ admin console screens in Blade and CSS, replacing Teams and spreadsheet request tracking, and developed the shared layout and sidebar used by every console page in a multi-developer team. I also contributed workflow improvements to a codebase with RBAC, immutable audit logs, and real-time notifications.'
    ],
    results: ['10+ admin console screens delivered', 'Replaced Teams and spreadsheet request tracking', 'Shared layout used by every console page', 'Six departments in one system'],
    images: ['assets/images/projects/one-shared-services.png']
  },
  {
    id: 'plp-admissions-enrollment', kind: 'featured', title: 'PLP Admissions & Enrollment',
    summary: 'Two connected systems that take applicants from document submission to Certificate of Registration (COR) issuance.',
    overview: 'Admissions feeds admitted applicants to Enrollment over secure HTTPS intake.',
    role: 'Designer and developer',
    services: ['System design', 'Admissions module', 'Enrollment module', 'Role-based access control'],
    stack: ['PHP', 'Next.js', 'Mantine', 'Supabase'],
    about: [
      'Admissions covers document verification, an exam builder and scheduler, interview room and queue management, and automated access and password generation, with RBAC for Admin, SSO, Deans, Professors, and Proctors.',
      'Enrollment (Next.js, Mantine, Supabase) takes in admitted applicants over HTTPS, numbers students automatically, schedules sections and professors, handles mass reschedules and optional payment clearance, and issues the COR, with RBAC for Registrar, Finance, Dean, College Secretary, Professors, and Admin.'
    ],
    results: ['Applicant to COR in two connected systems', 'Automatic student numbering', 'Mass reschedules and optional payment clearance'],
    images: []
  },
  {
    id: 'abtcms', kind: 'featured', title: 'Animal Bite Treatment Center MS',
    summary: 'A desktop management system for the Pasig City Animal Bite Treatment Center, replacing an error-prone Excel workflow.',
    overview: 'Offline-first with SQLite, syncing to a remote PostgreSQL instance hosted on Fedora.',
    role: 'Solo project', status: 'In development',
    services: ['Workflow analysis', 'Database design', 'Desktop app', 'Statistics reporting'],
    stack: ['C# WPF', '.NET', 'SQLite', 'PostgreSQL', 'Python'],
    about: [
      'I identified workflow inefficiencies at the center and designed a database-driven system for patient tracking, registry, vaccination schedules, and statistics reporting.',
      'Core logic is in C# (WPF) with offline-first operation, syncing SQLite to PostgreSQL for full-scale operations and analytics. Python-based analytics and iterative testing improved data handling and predictive insights.'
    ],
    results: ['Automated dose scheduling', 'Statistics dashboards', 'Works offline, syncs to PostgreSQL'],
    images: ['assets/images/projects/abtcms.png','assets/images/projects/abtcms-2.png','assets/images/projects/abtcms-3.png','assets/images/projects/abtcms-4.png']
  },
  {
    id: 'lakbay-pasig', kind: 'featured', title: 'Lakbay Pasig',
    summary: 'A Progressive Web App for Pasig heritage sites, businesses, and guided routes verified by the Tourism Office (CATO).',
    overview: 'Content verified by the Tourism Office, with GPS/QR-unlocked trail stops and offline downloads.',
    role: 'Developer, team of three', services: ['Progressive Web App', 'Row level security', 'Map discovery'],
    stack: ['React', 'TypeScript', 'Supabase'],
    about: ['RBAC for Guests, Users, Vendors, and CATO Staff/Admins using row level security, with review queues and an activity log. Map discovery with directions, GPS/QR-unlocked trail stops, offline downloads, and voice search.'],
    results: ['Content verified by the Tourism Office', 'GPS/QR-unlocked trail stops', 'Offline downloads and voice search'],
    link: { label: 'Visit live site', url: 'https://lakbay-pasig.vercel.app' },
    images: ['assets/images/projects/lakbay-pasig.png','assets/images/projects/lakbay-pasig-2.png','assets/images/projects/lakbay-pasig-3.png','assets/images/projects/lakbay-pasig-4.png','assets/images/projects/lakbay-pasig-5.png','assets/images/projects/lakbay-pasig-6.png','assets/images/projects/lakbay-pasig-7.png']
  },
  {
    id: 'amkor-ims', kind: 'grid', title: 'Amkor IMS Prototype', metric: 'Laravel · React',
    summary: 'An internal management system prototype for Amkor Travel & Tours covering 20 modules across two branches.',
    role: 'Designer and developer', services: ['System design', 'RBAC', 'PDF generation'],
    stack: ['Laravel', 'React', 'Inertia', 'PostgreSQL', 'Laravel Reverb'],
    about: ['RBAC for 17 roles, audit trails, and real-time notifications. Modules include reservations, visa processing, accounts payable and receivable, disbursements, attendance, leave, and overtime, with PDF generation from official templates.'],
    results: ['20 modules across two branches', 'RBAC for 17 roles', 'PDFs generated from official templates'], images: []
  },
  {
    id: 'pillar', kind: 'grid', title: 'Pillar', metric: 'Laravel · Livewire',
    summary: 'A scholar support and ticketing system for RealLIFE BGC, with a chatbot that escalates to an admin when it cannot help.',
    role: 'Developer',
    services: ['Ticketing system', 'Knowledge base auto-responses', 'Escalation logic', 'Role-based access control'],
    stack: ['Laravel', 'Blade', 'Livewire'],
    about: [
      'The admin team could not be everywhere at once for scholars asking questions daily. Pillar organizes concerns by category and shows whether similar concerns were already resolved.',
      'Tickets move through open, AI-handled, escalated, resolved, and closed. Knowledge base auto-responses handle common questions, and escalation sends the rest straight to an admin. RBAC covers Scholars, Staff, and Admins.'
    ],
    results: ['Supports 70+ active scholars', 'Five-stage ticket lifecycle', 'Automatic escalation to admins'],
    images: ['assets/images/projects/pillar.png']
  },
  {
    id: 'c-links', kind: 'grid', title: 'C-Links', metric: 'Next.js · Supabase',
    summary: 'A web app for managing the links behind NFC business cards.',
    role: 'Developer', services: ['Web app', 'NFC chip writing', 'Reporting'],
    stack: ['Next.js', 'Supabase', 'Vercel'],
    about: ['Permanent short links, tap counting, partner-only access, in-app NFC chip writing, stock and purchase tracking, and exportable reports.'],
    results: ['Permanent short links with tap counting', 'In-app NFC chip writing', 'Exportable reports'],
    images: ['assets/images/projects/c-links.png', 'assets/images/projects/c-links-2.png', 'assets/images/projects/c-links-3.png']
  },
  {
    id: 'qualia', kind: 'grid', title: 'Qualia', metric: 'Android',
    summary: 'An offline-first Android journaling and mindfulness app.',
    role: 'Developer', services: ['Android app', 'Offline-first storage'],
    stack: ['Java', 'Android SDK', 'Room', 'SQLite'],
    about: ['A 70-session guided experience, custom drawing tools, and text, voice, and camera-based journaling.'],
    results: ['70-session guided experience', 'Text, voice, and camera journaling', 'Works fully offline'], images: []
  },
  {
    id: 'training-center', kind: 'grid', title: 'Training & Certification Center MS', metric: 'VB.NET · MySQL',
    summary: 'A desktop management system for a multi-branch training center.',
    role: 'Academic project', services: ['Database design', 'Desktop app'], stack: ['VB.NET', 'MySQL', 'XAMPP'],
    about: ['Handles course enrollment, branch-specific pricing and discounts, installment payment tracking, trainer assignment (lead, co-trainer, guest), and certification records. Designed with full normalization analysis (UNR to 3NF) and intentional denormalization for overdue payment reports.'],
    results: ['Normalization analysis from UNR to 3NF', 'Branch-specific pricing and discounts', 'Installment payment tracking'],
    images: ['assets/images/projects/training-center.png']
  },
  {
    id: 'sales-system', kind: 'grid', title: 'Sales System', metric: 'VB.NET · MySQL',
    summary: 'An academic sales management system with transactions, inventory tracking, and reporting.',
    role: 'Academic project', services: ['Database-driven application'], stack: ['VB.NET', 'MySQL', 'XAMPP'],
    about: ['Core business logic: transaction handling, inventory tracking, and reporting, built to demonstrate database-driven application development.'],
    images: ['assets/images/projects/sales-system.png']
  },
  {
    id: 'shark-feast', kind: 'grid', title: 'Shark Feast Survival', metric: 'C++',
    summary: 'An arcade survival game: dodge bombs, catch fish, rack up points.',
    role: 'Developer, team of three', services: ['Game development'], stack: ['C++'],
    about: ['Built in 4 days by 2 developers and 1 graphic designer for a course requirement.'],
    images: ['assets/images/projects/shark-feast.png','assets/images/projects/shark-feast-2.png']
  },
  {
    id: 'dice-game', kind: 'grid', title: 'Retro Dice Game', metric: 'VB.NET',
    summary: 'A dice game with a Mario-inspired pixel aesthetic, built in under an hour.',
    role: 'Academic project', services: ['Game development'], stack: ['VB.NET'],
    about: ['Designed and built in under an hour, a test of quick execution under time pressure.'],
    images: ['assets/images/projects/dice-game.png']
  },
  {
    id: 'frog-cloud-catcher', kind: 'grid', title: 'Frog Da Cloud Catcher', metric: 'Scratch',
    summary: 'The first game I ever made with code.',
    role: 'Personal project', services: ['Game development'], stack: ['Scratch'],
    about: ['A side-scrolling arcade survival game where a frog jumps between incoming clouds. Clouds speed up as the score climbs, and a high score tracker keeps it competitive. Gravity, jump physics, collision detection, score logic, costume swaps, and an 8-bit soundtrack, all built in Scratch.'],
    link: { label: 'Play on Scratch', url: 'https://scratch.mit.edu/projects/1285122508' },
    images: ['assets/images/projects/frog-cloud-catcher.jpg']
  }
];
