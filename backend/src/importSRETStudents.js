require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const XLSX = require('xlsx');

const EXCEL_LIST1 = path.join(__dirname, '../../SRET Batch Codes - List 1.xlsx');
const EXCEL_LIST2 = path.join(__dirname, '../../SRET Batch Codes - List 2.xlsx');

const MONGO_URI = process.env.MONGO_URI;

async function importSRETStudents() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const collection = mongoose.connection.db.collection('sretStudentMetadata');

  // --------------- List 1 (135 rows, has Email) ---------------
  const wb1 = XLSX.readFile(EXCEL_LIST1);
  console.log('List1 sheets:', wb1.SheetNames);
  const rows1 = XLSX.utils.sheet_to_json(wb1.Sheets[wb1.SheetNames[0]]);
  console.log('List1 rows:', rows1.length);
  if (rows1[0]) console.log('List1 sample:', rows1[0]);

  let count = 0;
  for (const row of rows1) {
    const email = row['Email']?.toLowerCase()?.trim();
    const doc = {
      name: `${row['First Name'] || ''} ${row['Last Name'] || ''}`.trim(),
      emailId: email || null,
      batchCode: row['Batch codes'] || null,
      batchName: row['Batch Name'] || null,
      degree: row['Exam'] || null,
      source: 'list1',
    };
    if (email) {
      await collection.updateOne({ emailId: email }, { $set: doc }, { upsert: true });
    } else {
      await collection.insertOne(doc);
    }
    count++;
    if (count % 50 === 0) console.log(`Processed ${count}`);
  }
  console.log(`List1: processed ${count} rows`);

  // --------------- List 2 (38 rows, no Email — use rollNo as key) ---------------
  const wb2 = XLSX.readFile(EXCEL_LIST2);
  console.log('List2 sheets:', wb2.SheetNames);
  const rows2 = XLSX.utils.sheet_to_json(wb2.Sheets[wb2.SheetNames[0]]);
  console.log('List2 rows:', rows2.length);
  if (rows2[0]) console.log('List2 sample:', rows2[0]);

  let count2 = 0;
  for (const row of rows2) {
    const rollNo = (row['University Roll No.'] || '').toString().trim();
    const doc = {
      name: row['Student Name']?.trim() || null,
      emailId: null,
      universityRollNo: rollNo || null,
      batchCode: row['Batch code'] || null,
      batchName: row['Batch Name'] || null,
      degree: row['Degree'] || null,
      department: row['Faculty/Department'] || null,
      yearOfPassing: row['Year of Passing'] || null,
      source: 'list2',
    };
    if (rollNo) {
      await collection.updateOne({ universityRollNo: rollNo }, { $set: doc }, { upsert: true });
    } else {
      await collection.insertOne(doc);
    }
    count2++;
  }
  console.log(`List2: processed ${count2} rows`);

  // Create index on emailId for fast lookups
  await collection.createIndex({ emailId: 1 }, { sparse: true });
  console.log('Index created on emailId');

  const total = await collection.countDocuments();
  console.log(`Total documents in sretStudentMetadata: ${total}`);

  await mongoose.disconnect();
  console.log('Done.');
}

importSRETStudents().catch(console.error);
