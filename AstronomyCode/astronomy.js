let tableData = {
    table2: [],
    table3: [],
    table4: [],
    table6: []
    // Add more tables as needed
};

const csvFiles = {
    table2: './AstronomyCode/Table2Data.csv',
    table3: './AstronomyCode/Table3Data.csv',
    table4: './AstronomyCode/Table4Data.csv',
    table6: './AstronomyCode/Table6Data.csv'
    // Add more mappings as needed
};

let currentFilteredData = [];

document.addEventListener('DOMContentLoaded', function () {
    // Load data for each table
    let loadPromises = Object.keys(csvFiles).map(tableId => {
        return fetch(csvFiles[tableId])
            .then(response => response.text())
            .then(contents => {
                tableData[tableId] = Papa.parse(contents, { header: true }).data;
                // Initialize table display when all data is loaded
                if (Object.keys(tableData).every(id => tableData[id].length > 0)) {
                    // Initialize the first table
                    displayResults('table2', tableData.table2);
                }
            });
    });

    Promise.all(loadPromises).then(() => {
        // Setup event listeners
        document.getElementById('YBmax').addEventListener('input', searchData);
        document.getElementById('YBmin').addEventListener('input', searchData);
        document.getElementById('lmax').addEventListener('input', searchData);
        document.getElementById('lmin').addEventListener('input', searchData);
        document.getElementById('bmax').addEventListener('input', searchData);
        document.getElementById('bmin').addEventListener('input', searchData);
    });
});

function searchData() {
    const activeTableId = document.querySelector('.tab-content:not([style*="display: none"])').id;

    const MaxYB = parseFloat(document.getElementById('YBmax').value);
    const MinYB = parseFloat(document.getElementById('YBmin').value);
    const MaxL = parseFloat(document.getElementById('lmax').value);
    const MinL = parseFloat(document.getElementById('lmin').value);
    const MaxB = parseFloat(document.getElementById('bmax').value);
    const MinB = parseFloat(document.getElementById('bmin').value);

    const filteredData = tableData[activeTableId].filter(item => {
        const YBnum = parseInt(item['YB']);
        const l = parseFloat(item['l']);
        const b = parseFloat(item['b']);

        return (
            (isNaN(MaxB) || b <= MaxB) &&
            (isNaN(MinB) || b >= MinB) &&
            (isNaN(MaxL) || l <= MaxL) &&
            (isNaN(MinL) || l >= MinL) &&
            (isNaN(MaxYB) || YBnum <= MaxYB) &&
            (isNaN(MinYB) || YBnum >= MinYB)
        );
    });
    currentFilteredData = filteredData;
    displayResults(activeTableId, filteredData);
}

function displayResults(tableId, data) {
    const table = document.querySelector(`#${tableId} table`);
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');

    // Clear previous content
    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (data.length === 0) return;

    // Generate table headers dynamically
    const headers = Object.keys(data[0]);
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Generate table rows dynamically
    data.forEach(item => {
        const row = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = item[header] || ''; // Handle missing data gracefully
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
}

function showTable(tableId) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.style.display = 'none');
    document.getElementById(tableId).style.display = 'block';

    applySearchFilter();
}

function applySearchFilter() {
    searchData();
}

function downloadCSV() {
    if (currentFilteredData.length === 0) {
        alert('No data available for download.');
        return;
    }

    const headers = Object.keys(currentFilteredData[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    currentFilteredData.forEach(row => {
        csvRows.push(headers.map(header => row[header] || '').join(','));
    });

    // Create CSV file and trigger download
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'filtered-data.csv');
    link.click();

    // Cleanup
    URL.revokeObjectURL(url);
}

function downloadCSVall() {
    const activeTableId = document.querySelector('.tab-content:not([style*="display: none"])').id;
    const fileUrl = csvFiles[activeTableId];

    if (!fileUrl) {
        alert('No file URL available for the active table.');
        return;
    }

    // Fetch the CSV file from the URL
    fetch(fileUrl)
        .then(response => response.text())
        .then(csvContent => {
            // Create a Blob from the CSV content
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', 'full-data.csv');
            link.click();

            // Cleanup
            URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error fetching the CSV file:', error);
            alert('Failed to download the CSV file.');
        });
}

// Initialize by showing the first table
showTable('table2');
