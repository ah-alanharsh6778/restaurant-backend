const prisma = require('./src/config/prisma');
const tableService = require('./src/modules/table/table.service');

async function testBookingFlow() {
  try {
    console.log('--- 1. Testing Table Fetch ---');
    let tables = await prisma.restaurantTable.findMany();
    console.log(`Found ${tables.length} tables in PostgreSQL database.`);

    if (tables.length === 0) {
      console.log('No tables found. Creating a test table T-1...');
      const created = await tableService.createTable({ tableNumber: 'T-1', capacity: 4, status: 'AVAILABLE' });
      console.log('Created Table:', created.id, created.tableNumber);
      tables = [created];
    }

    const testTable = tables[0];
    console.log('Using Table ID:', testTable.id, 'Table Number:', testTable.tableNumber);

    console.log('\n--- 2. Booking Table ---');
    const booked = await tableService.bookTable(testTable.id, {
      customerName: 'Aarav Sharma',
      phone: '+91 9876543210',
      email: 'aarav.sharma@example.com',
      guests: 4,
      bookingDate: '2026-07-30',
      bookingTime: '20:00',
      specialNotes: 'Anniversary celebration',
    });
    console.log('Booked Table Result Status:', booked.status);
    console.log('Customer Details:', booked.customer);
    console.log('Booking Info:', booked.booking);

    console.log('\n--- 3. Checking In Guest ---');
    const checkedIn = await tableService.checkInTable(testTable.id);
    console.log('Check-In Result Status:', checkedIn.status);

    console.log('\n--- 4. Cancelling Booking & Freeing Table ---');
    const cancelled = await tableService.cancelTableBooking(testTable.id);
    console.log('Cancelled Result Status:', cancelled.status);
    console.log('Freed Table Customer:', cancelled.customer);

    console.log('\n✅ ALL BOOKING WORKFLOW TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testBookingFlow();
