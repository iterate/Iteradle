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
    nameMultilang: row['Name (multilang)'] || '',
    title: row['Title (no)'] || '',
    email: row['Email'] || '',
    upn: row['UPN'] || '',
    externalUserId: row['External User ID'] || '',
    cvPartnerUserId: row['CV Partner User ID'] || '',
    cvPartnerCvId: row['CV Partner CV ID'] || '',
    phoneNumber: row['Phone Number'] || '',
    landline: row['Landline'] || '',
    birthYear: parseInt(row['Birth Year']) || 0,
    department: row['Department'] || '',
    country: row['Country'] || '',
    userCreatedAt: row['User created at'] || '',
    cvLastUpdatedByOwner: row['CV Last updated by owner'] || '',
    cvLastUpdated: row['CV Last updated'] || '',
    yearsOfEducation: parseInt(row['Years of education']) || 0,
    yearsSinceFirstWorkExperience: parseInt(row['Years since first work experience']) || 0,
    hasProfileImage: row['Has profile image'] === 'true',
    ownsReferenceProject: row['Owns a reference project'] === 'true',
    readAndUnderstoodPrivacyNotice: row['Read and understood privacy notice'] === 'true',
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
