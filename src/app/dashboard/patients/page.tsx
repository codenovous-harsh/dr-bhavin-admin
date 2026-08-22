'use client';

import PageContainer from '@/components/layout/page-container';
import PatientStatsCards from '@/features/skinAnalysis/components/patient-stats-cards';
import { PatientsDataTable } from '@/features/skinAnalysis/components/patients-data-table';

export default function PatientsPage() {
  return (
    <PageContainer
      pageTitle='Patients'
      pageDescription='Skin analysis submissions and their results.'
    >
      <PatientStatsCards />
      <PatientsDataTable />
    </PageContainer>
  );
}
