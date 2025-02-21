# Revenue Report - Taxes Zone Sylhet TDS

This project is a dynamic web application displaying revenue collection data for the Taxes Zone Sylhet TDS (Tax Deducted at Source) report. It provides an interactive dashboard with charts and tables to visualize team-wise revenue contributions and growth trends for the fiscal years 2023-24 and 2024-25.

## Features

- **Revenue Visualization**:
  - **Line Chart**: Displays cumulative revenue collection up to January ("Upto January" view) for all teams and individual teams.
  - **Bar Chart**: Shows revenue collection for January only ("January" view) for all teams and individual teams.
  - **Pie Chart**: Illustrates team-wise contribution percentages for 2023-24 and 2024-25, with collection details on hover.
  - **Raw Data Table**: Detailed tabular view of revenue data by team and authority.

- **Interactive Views**:
  - Toggle between "Raw Data," "Upto January," and "January" views via navbar buttons.
  - Growth percentage displayed dynamically on charts.

- **Responsive Design**:
  - Optimized for both mobile and desktop views.
  - Mobile: Compact layout with adjusted chart heights, abbreviated month names, and simplified Y-axis labels.
  - Desktop: Full-featured layout with detailed labels and larger charts.

- **Dark/Light Mode**:
  - Switchable theme with professional icons (sun for light, moon for dark) in the navbar.

## Technologies Used

- **Frontend**: [React](https://reactjs.org/) with TypeScript for type-safe, component-based development.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for responsive, utility-first design with dark mode support.
- **Charts**: [Chart.js](https://www.chartjs.org/) with [react-chartjs-2](https://github.com/reactchartjs/react-chartjs-2) for interactive visualizations, enhanced with [chartjs-plugin-datalabels](https://github.com/chartjs/chartjs-plugin-datalabels).
- **Deployment**: [Vercel](https://vercel.com/) for hosting, linked to GitHub for automatic deployments.

## Getting Started

### Prerequisites
- Node.js (v14 or later) and npm installed.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/revenue-report.git
   cd revenue-report
