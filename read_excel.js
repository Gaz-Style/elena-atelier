const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'Carta Gantt Garçonne (Gabriela Martinez).xlsx');
try {
  const workbook = xlsx.readFile(filePath);
  
  // Iterate through all sheets
  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const worksheet = workbook.Sheets[sheetName];
    // Convert to JSON and print
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    data.forEach(row => {
      // Filter out empty rows
      if (row.length > 0 && row.some(cell => cell !== undefined && cell !== null && cell !== '')) {
        console.log(row.map(cell => cell || '').join(' | '));
      }
    });
  });
} catch (error) {
  console.error("Error reading file:", error.message);
}
