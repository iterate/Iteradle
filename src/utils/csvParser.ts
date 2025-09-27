import Papa from 'papaparse';
import type { Iterator } from '../types/Iterator';

export const parseCSVData = (csvText: string): Iterator[] => {
  const results = Papa.parse(csvText, {
    header: true,
    delimiter: ';',
    skipEmptyLines: true,
  });

  return results.data.map((row: any) => ({
    name: row['Name'] || '',
    title: row['Title (no)'] || '',
    email: row['Email'] || '',
    phoneNumber: row['Phone Number'] || '',
    birthYear: parseInt(row['Birth Year']) || 0,
    country: row['Country'] || '',
    gender: row['Gender'] || '',
    yearsOfEducation: parseInt(row['Years of education']) || 0,
    experience: parseInt(row['Experience']) || 0,
  }));
};

export const loadCSVData = async (): Promise<Iterator[]> => {
  try {
    const response = await fetch('/Iterators.csv');
    const csvText = await response.text();
    return parseCSVData(csvText);
  } catch (error) {
    console.error('Error loading CSV data:', error);
    return [];
  }
};
