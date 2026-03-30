import * as XLSX from 'xlsx';

/**
 * Formats granular activity data into a matrix-style report for Overall Detailed Export.
 * Rows: (Date, Name, ID, Domain)
 * Columns: 9-10, 10-11, ..., 17-18, Total Minutes, Total Hours
 */
export const formatOverallReport = (data) => {
    // 1. Group records by Date + UserID
    const grouped = {};
    data.forEach(row => {
        const dateKey = new Date(row.activity_date).toISOString().split('T')[0];
        const key = `${dateKey}_${row.user_id}`;
        if (!grouped[key]) {
            grouped[key] = {
                date: dateKey,
                userName: row.userName,
                employee_id: row.employee_id || 'N/A',
                domain: row.domain || 'N/A',
                slots: {}
            };
        }
        grouped[key].slots[row.activity_hour] = row.active_minutes;
    });

    // 2. Define headers
    const timeSlots = [9, 10, 11, 12, 13, 14, 15, 16, 17];
    const headers = [
        'Date', 'Name', 'Employee ID', 'Department',
        ...timeSlots.map(h => `${h}:00 - ${h + 1}:00`),
        'Total Minutes', 'Total Hours', 'Efficiency %'
    ];

    // 3. Prepare rows
    const rows = Object.values(grouped).map(item => {
        const row = [
            item.date,
            item.userName,
            item.employee_id,
            item.domain
        ];
        
        let totalMins = 0;
        timeSlots.forEach(h => {
            const mins = item.slots[h] || 0;
            row.push(mins > 0 ? mins : '-');
            totalMins += mins;
        });

        const totalHrs = parseFloat((totalMins / 60).toFixed(2));
        const efficiencyVal = (totalHrs / 8) * 100;
        const efficiency = totalHrs > 0 ? (efficiencyVal.toFixed(1) + '%') : '-';
        
        row.push(totalMins > 0 ? totalMins : '-');
        row.push(totalHrs > 0 ? totalHrs : '-');
        row.push(efficiency);
        return row;
    });

    return [headers, ...rows];
};

/**
 * Formats granular activity data for Individual Detailed Export.
 * Includes user metadata at the top.
 */
export const formatIndividualReport = (user, data) => {
    const timeSlots = [9, 10, 11, 12, 13, 14, 15, 16, 17];
    
    // 1. Metadata Header
    const aoa = [
        ['INDIVIDUAL PERFORMANCE AUDIT REPORT'],
        [],
        ['Name:', user.name],
        ['Employee ID:', user.employee_id || 'N/A'],
        ['Department:', user.domain || 'N/A'],
        ['Generated At:', new Date().toLocaleString()],
        [],
        ['ACTIVITY LOG BREAKDOWN BY DATE'],
        ['Date', ...timeSlots.map(h => `${h}:00 - ${h + 1}:00`), 'Total Minutes', 'Total Hours', 'Efficiency %']
    ];

    // 2. Group by Date
    const byDate = {};
    data.forEach(row => {
        const dateKey = new Date(row.activity_date).toISOString().split('T')[0];
        if (!byDate[dateKey]) byDate[dateKey] = {};
        byDate[dateKey][row.activity_hour] = row.active_minutes;
    });

    // 3. Sort dates and build rows
    const sortedDates = Object.keys(byDate).sort();
    sortedDates.forEach(date => {
        const row = [date];
        let totalMins = 0;
        timeSlots.forEach(h => {
            const mins = byDate[date][h] || 0;
            row.push(mins > 0 ? mins : '-');
            totalMins += mins;
        });
        const totalHrs = parseFloat((totalMins / 60).toFixed(2));
        const efficiencyVal = (totalHrs / 8) * 100;
        const efficiency = totalHrs > 0 ? (efficiencyVal.toFixed(1) + '%') : '-';
        
        row.push(totalMins > 0 ? totalMins : '-');
        row.push(totalHrs > 0 ? totalHrs : '-');
        row.push(efficiency);
        aoa.push(row);
    });

    return aoa;
};

export const downloadExcelAOA = async (aoa, filename) => {
    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Performance Data");
    
    // Auto-size columns (rough approximation)
    const maxWidths = aoa[aoa.length - 1]?.map(() => 15) || [];
    worksheet['!cols'] = maxWidths.map(w => ({ wch: w }));

    const safeFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;

    // Use File System Access API if available for "Save As" experience
    if (typeof window !== "undefined" && window.showSaveFilePicker) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: safeFilename,
                types: [
                    {
                        description: "Excel file",
                        accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] },
                    },
                ],
            });
            
            const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
            const writable = await handle.createWritable();
            await writable.write(buffer);
            await writable.close();
            return true;
        } catch (err) {
            if (err && err.name === "AbortError") return false;
            console.error("Save File Picker error, falling back to legacy download:", err);
        }
    }

    // Fallback to traditional download
    XLSX.writeFile(workbook, safeFilename);
    return true;
};

