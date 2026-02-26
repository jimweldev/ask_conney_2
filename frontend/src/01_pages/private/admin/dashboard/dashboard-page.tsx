import PageHeader from '@/components/typography/page-header';
import DashboardAccountTypesChartPanel from './_panels/dashboard-account-types-chart-panel';
import DashboardStatisticsPanel from './_panels/dashboard-statistics-panel';
import DashboardUserRegistrationStatisticsPanel from './_panels/dashboard-user-registration-statistics-panel';

const DashboardPage = () => {
  return (
    <>
      <PageHeader className="mb-3">Dashboard</PageHeader>

      {/* Dashboard content area */}
      <div className="space-y-layout">
        {/* Statistics overview cards */}
        <DashboardStatisticsPanel />

        {/* Grid layout for charts */}
        <div className="gap-layout grid grid-cols-12">
          {/* User registration statistics chart */}
          <DashboardUserRegistrationStatisticsPanel />

          {/* Account types distribution chart */}
          <DashboardAccountTypesChartPanel />
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
