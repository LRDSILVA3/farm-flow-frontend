const xlsx = require('xlsx');
const fs = require('fs');

const filePath = process.argv[2];
const targetSheetName = process.argv[3]; // New argument for sheet name

if (!filePath) {
  console.error('Please provide a path to an XLSX file.');
  process.exit(1);
}

try {
  const workbook = xlsx.readFile(filePath, { cellFormulas: true });
  const result = {};

  const processSheet = (sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      console.warn(`Sheet "${sheetName}" not found in the workbook.`);
      return;
    }
    const sheetData = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    const formulas = [];

    for (const cell in worksheet) {
      if (worksheet[cell].f) {
        formulas.push({
          cell,
          formula: worksheet[cell].f
        });
      }
    }

    result[sheetName] = {
      data: sheetData,
      formulas: formulas
    };
  };

  if (targetSheetName) {
    // Process only the specified sheet
    processSheet(targetSheetName);
  } else {
    // Process all sheets if no specific sheet name is provided
    workbook.SheetNames.forEach(processSheet);
  }

  console.log(JSON.stringify(result, null, 2));

} catch (error) {
  console.error(`Error reading or processing the file: ${error.message}`);
  process.exit(1);
}