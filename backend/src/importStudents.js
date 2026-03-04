require('dotenv').config();
const mongoose = require('mongoose');
const XLSX = require('xlsx');

const MONGO_URI = process.env.MONGO_URI;

async function importStudents() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const workbook = XLSX.readFile('./SRMKTR AI Interview Student Details.xlsx');
  console.log('Workbook sheets:', workbook.SheetNames);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);
  console.log('Rows length:', rows.length);
  if (rows.length > 0) console.log('First row:', rows[0]);

  const collection = mongoose.connection.db.collection('studentmetadata');

  let count = 0;
  for (const row of rows) {
    console.log(`Processing row ${count + 1}`);
    const doc = {
      registrationNumber: row['Registration Number'],
      name: row['Name'],
      emailId: row['Email ID']?.toLowerCase(),
      batchName: row['Batch Name'],
      batchCode: row['Batch Code'],
      timeId: row['TIME ID']
    };
    await collection.insertOne(doc);
    count++;
    if (count % 100 === 0) console.log(`Inserted ${count}`);
  }

  console.log(`Imported ${count} students`);
  await mongoose.disconnect();
}

importStudents().catch(console.error);