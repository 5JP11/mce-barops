import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding MCE BarOps database...\n');

  // ── Branches ──
  const branches = await Promise.all([
    prisma.branch.create({ data: { name: 'The Gilded Lily', location: 'Downtown' } }),
    prisma.branch.create({ data: { name: 'Neon Vault', location: 'East Side' } }),
    prisma.branch.create({ data: { name: 'Silver Slate', location: 'The Heights' } }),
    prisma.branch.create({ data: { name: 'Onyx Lounge', location: 'Waterfront' } }),
  ]);
  console.log(`✅ Created ${branches.length} branches`);

  // ── Categories ──
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'EPOS / Tills' } }),
    prisma.category.create({ data: { name: 'Network / WiFi' } }),
    prisma.category.create({ data: { name: 'Sound System' } }),
    prisma.category.create({ data: { name: 'Lighting / DMX' } }),
    prisma.category.create({ data: { name: 'CCTV / Security' } }),
    prisma.category.create({ data: { name: 'HVAC / Climate' } }),
    prisma.category.create({ data: { name: 'Office Equipment' } }),
    prisma.category.create({ data: { name: 'Other' } }),
  ]);
  console.log(`✅ Created ${categories.length} categories`);

  // ── Assets ──
  const assets = await Promise.all([
    prisma.asset.create({ data: { name: 'EPOS Terminal #1', branchId: branches[0].id, categoryId: categories[0].id, location: 'Main Bar' } }),
    prisma.asset.create({ data: { name: 'EPOS Terminal #2', branchId: branches[0].id, categoryId: categories[0].id, location: 'VIP Section' } }),
    prisma.asset.create({ data: { name: 'Main Router', branchId: branches[0].id, categoryId: categories[1].id, location: 'Back Office' } }),
    prisma.asset.create({ data: { name: 'DJ Console', branchId: branches[1].id, categoryId: categories[2].id, location: 'DJ Booth' } }),
    prisma.asset.create({ data: { name: 'DMX Controller', branchId: branches[1].id, categoryId: categories[3].id, location: 'Dance Floor' } }),
    prisma.asset.create({ data: { name: 'CCTV Server', branchId: branches[2].id, categoryId: categories[4].id, location: 'Back Office' } }),
    prisma.asset.create({ data: { name: 'AC Unit - Main', branchId: branches[2].id, categoryId: categories[5].id, location: 'Main Bar' } }),
    prisma.asset.create({ data: { name: 'EPOS Terminal #1', branchId: branches[3].id, categoryId: categories[0].id, location: 'Main Bar' } }),
    prisma.asset.create({ data: { name: 'Wireless AP #1', branchId: branches[3].id, categoryId: categories[1].id, location: 'Entry / Reception' } }),
  ]);
  console.log(`✅ Created ${assets.length} assets`);

  // ── Users ──
  const pw = await bcrypt.hash('password123', 10);
  const users = await Promise.all([
    prisma.user.create({ data: { name: 'Alex Rivera', email: 'admin@mce.com', password: pw, role: 'SUPER_ADMIN', phone: '09170000001' } }),
    prisma.user.create({ data: { name: 'Jordan Cruz', email: 'it@mce.com', password: pw, role: 'IT_ADMIN', phone: '09170000002' } }),
    prisma.user.create({ data: { name: 'Jamie Santos', email: 'manager.lily@mce.com', password: pw, role: 'BRANCH_MANAGER', branchId: branches[0].id, phone: '09170000003' } }),
    prisma.user.create({ data: { name: 'Sam Reyes', email: 'manager.neon@mce.com', password: pw, role: 'BRANCH_MANAGER', branchId: branches[1].id, phone: '09170000004' } }),
    prisma.user.create({ data: { name: 'Chris Torres', email: 'staff.lily@mce.com', password: pw, role: 'STAFF', branchId: branches[0].id, phone: '09170000005' } }),
    prisma.user.create({ data: { name: 'Pat Navarro', email: 'staff.neon@mce.com', password: pw, role: 'STAFF', branchId: branches[1].id, phone: '09170000006' } }),
    prisma.user.create({ data: { name: 'Morgan Dela Cruz', email: 'maintenance@mce.com', password: pw, role: 'MAINTENANCE', phone: '09170000007' } }),
    prisma.user.create({ data: { name: 'Casey Villanueva', email: 'office@mce.com', password: pw, role: 'OFFICE', phone: '09170000008' } }),
  ]);
  console.log(`✅ Created ${users.length} users`);

  // ── Sample IT Tickets ──
  const tickets = await Promise.all([
    prisma.ticket.create({
      data: {
        ticketNumber: 'INC-0001',
        title: 'EPOS Terminal #2 screen is black',
        description: 'The VIP bar EPOS has gone dark mid-shift. Staff cannot process card payments. Tried restarting twice - no response.',
        type: 'IT_INCIDENT', status: 'NEW', urgency: 'CRITICAL',
        branchId: branches[0].id, categoryId: categories[0].id, assetId: assets[1].id,
        ownerId: users[4].id, issueLocation: 'VIP Section',
      }
    }),
    prisma.ticket.create({
      data: {
        ticketNumber: 'INC-0002',
        title: 'WiFi keeps dropping in DJ booth area',
        description: 'The wireless access point near the DJ booth disconnects every 15 minutes. Affecting ability to stream playlists.',
        type: 'IT_INCIDENT', status: 'ASSIGNED', urgency: 'HIGH',
        branchId: branches[1].id, categoryId: categories[1].id,
        ownerId: users[5].id, assigneeId: users[1].id, issueLocation: 'DJ Booth',
      }
    }),
    prisma.ticket.create({
      data: {
        ticketNumber: 'INC-0003',
        title: 'CCTV camera 4 offline since yesterday',
        description: 'Camera covering the main entrance has been offline. Security team flagged it during their morning check.',
        type: 'IT_INCIDENT', status: 'IN_PROGRESS', urgency: 'HIGH',
        branchId: branches[2].id, categoryId: categories[4].id, assetId: assets[5].id,
        ownerId: users[0].id, assigneeId: users[1].id, issueLocation: 'Entry / Reception',
        internalNotes: 'Checked the NVR - camera port shows disconnected. Likely a cable issue. Need to inspect the run.',
      }
    }),
    prisma.ticket.create({
      data: {
        ticketNumber: 'INC-0004',
        title: 'AC not cooling VIP section properly',
        description: 'Temperature in VIP area stays above 28°C even with AC at max. Guests have been complaining.',
        type: 'IT_INCIDENT', status: 'WAITING_PARTS', urgency: 'NORMAL',
        branchId: branches[2].id, categoryId: categories[5].id, assetId: assets[6].id,
        ownerId: users[0].id, assigneeId: users[1].id, issueLocation: 'VIP Section',
      }
    }),
  ]);

  // ── Sample Material Request Ticket ──
  const matTicket = await prisma.ticket.create({
    data: {
      ticketNumber: 'MAT-0001',
      title: 'Replacement cables and connectors for CCTV run',
      description: 'Need Cat6 cable and RJ45 connectors to re-run the CCTV camera 4 cable that appears damaged.',
      type: 'MATERIAL_REQUEST', status: 'SUBMITTED', urgency: 'HIGH',
      branchId: branches[2].id, categoryId: categories[4].id,
      ownerId: users[6].id, parentId: tickets[2].id,
    }
  });

  await Promise.all([
    prisma.materialItem.create({
      data: {
        ticketId: matTicket.id, itemName: 'Cat6 Ethernet Cable', description: 'Outdoor-rated, shielded',
        quantity: 30, unit: 'meters', estimatedCost: 45.00, reason: 'Replace damaged CCTV cable run',
        procurementStatus: 'SUBMITTED', neededBy: new Date(Date.now() + 3 * 86400000),
      }
    }),
    prisma.materialItem.create({
      data: {
        ticketId: matTicket.id, itemName: 'RJ45 Connectors (Shielded)', description: 'Cat6 compatible',
        quantity: 10, unit: 'pcs', estimatedCost: 8.00, reason: 'Terminate new cable run',
        procurementStatus: 'SUBMITTED',
      }
    }),
  ]);

  console.log(`✅ Created ${tickets.length + 1} tickets with material items`);

  // ── Sample Comments ──
  await Promise.all([
    prisma.comment.create({ data: { content: 'This is urgent - we have a full house tonight and need card payments working.', ticketId: tickets[0].id, userId: users[4].id } }),
    prisma.comment.create({ data: { content: 'Acknowledged. Checking remotely now. Can someone at the bar check if the power LED on the back is lit?', ticketId: tickets[0].id, userId: users[1].id } }),
    prisma.comment.create({ data: { content: 'Replaced the firmware on the AP. Monitoring for the next hour.', ticketId: tickets[1].id, userId: users[1].id, isInternal: true } }),
  ]);
  console.log('✅ Created sample comments');

  // ── Activity Logs ──
  await Promise.all([
    prisma.activityLog.create({ data: { ticketId: tickets[1].id, userId: users[1].id, action: 'STATUS_CHANGE', oldValue: 'NEW', newValue: 'ASSIGNED' } }),
    prisma.activityLog.create({ data: { ticketId: tickets[2].id, userId: users[1].id, action: 'STATUS_CHANGE', oldValue: 'ASSIGNED', newValue: 'IN_PROGRESS' } }),
    prisma.activityLog.create({ data: { ticketId: tickets[2].id, userId: users[1].id, action: 'INTERNAL_NOTE', newValue: 'Added internal note about NVR diagnosis' } }),
  ]);
  console.log('✅ Created activity logs');

  // ── Notifications ──
  await Promise.all([
    prisma.notification.create({ data: { userId: users[1].id, title: 'Critical Ticket', message: 'EPOS Terminal #2 is down at The Gilded Lily. Trade-stopper.', link: `/tickets/${tickets[0].id}` } }),
    prisma.notification.create({ data: { userId: users[7].id, title: 'New Material Request', message: 'Maintenance team needs cables for CCTV repair at Silver Slate.', link: `/maintenance/${matTicket.id}` } }),
  ]);
  console.log('✅ Created notifications\n');

  console.log('═══════════════════════════════════════');
  console.log('  🎉 Seeding complete!');
  console.log('═══════════════════════════════════════');
  console.log('\n  Login credentials (all accounts):');
  console.log('  Password: password123\n');
  console.log('  admin@mce.com       → Super Admin');
  console.log('  it@mce.com          → IT Admin');
  console.log('  manager.lily@mce.com → Branch Manager (Gilded Lily)');
  console.log('  manager.neon@mce.com → Branch Manager (Neon Vault)');
  console.log('  staff.lily@mce.com  → Staff (Gilded Lily)');
  console.log('  staff.neon@mce.com  → Staff (Neon Vault)');
  console.log('  maintenance@mce.com → Maintenance Team');
  console.log('  office@mce.com      → Office / Purchasing');
  console.log('');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
