import React, { useState, useEffect } from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Tick,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  months,
  allTeamsData,
  teamData,
  getCumulativeData,
  teamContributions,
  rawData,
} from "./data";

// Register ChartJS components and the datalabels plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartDataLabels
);

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<"raw" | "upto" | "month">("upto");
  const [isMobile, setIsMobile] = useState(false);

  const lastMonthIndex = months.indexOf("January");
  const januaryIndex = months.indexOf("January");

  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
    };
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get chart data based on view mode
  const getChartData = (data: number[]) => {
    if (viewMode === "month") {
      return [data[januaryIndex]]; // Only January data
    }
    const cumulative = getCumulativeData(data);
    return viewMode === "upto"
      ? cumulative.slice(0, januaryIndex + 1)
      : cumulative; // Cumulative up to January
  };

  // Calculate growth based on view mode
  const getGrowth = (current: number[], previous: number[]) => {
    const currData = getChartData(current);
    const prevData = getChartData(previous);
    const currTotal = currData[currData.length - 1];
    const prevTotal = prevData[prevData.length - 1];
    return (((currTotal - prevTotal) / prevTotal) * 100).toFixed(2);
  };

  // All Teams Chart Data
  const allTeamsChartData = {
    labels:
      viewMode === "month"
        ? ["January"]
        : months
            .slice(0, januaryIndex + 1)
            .map((month) => (isMobile ? month.slice(0, 3) : month)),
    datasets: [
      {
        label: "2024-2025",
        data: getChartData(allTeamsData["2024-2025"]),
        backgroundColor: viewMode === "month" ? "#3b82f6" : undefined,
        borderColor: viewMode === "upto" ? "#3b82f6" : "#3b82f6",
        fill: false,
        pointRadius: viewMode === "month" ? 0 : 5,
        pointHoverRadius: viewMode === "month" ? 0 : 7,
      },
      {
        label: "2023-2024",
        data: getChartData(allTeamsData["2023-2024"]),
        backgroundColor: viewMode === "month" ? "#ef4444" : undefined,
        borderColor: viewMode === "upto" ? "#ef4444" : "#ef4444",
        fill: false,
        pointRadius: viewMode === "month" ? 0 : 5,
        pointHoverRadius: viewMode === "month" ? 0 : 7,
      },
    ],
  };

  // Chart Options for Line and Bar
  const lineChartOptions = {
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) =>
            `${context.dataset.label}: ${context.raw.toLocaleString()} CR`,
        },
      },
      datalabels: { display: false },
    },
    scales: {
      y: {
        title: { display: true, text: "Collection (CR)" },
        ticks: isMobile
          ? {
              callback: (
                value: number | string,
                _index: number,
                _ticks: Tick[]
              ): string => {
                const crValue = Number(value) / 1e7; // Convert to crores
                return Number(crValue.toFixed(2)) + " CR"; // Two significant digits
              },
            }
          : undefined,
      },
      x: { title: { display: true, text: "Months" } },
    },
  };

  const barChartOptions = {
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) =>
            `${context.dataset.label}: ${context.raw.toLocaleString()} CR`,
        },
      },
      datalabels: { display: false },
    },
    scales: {
      y: {
        title: { display: true, text: "Collection (CR)" },
        ticks: isMobile
          ? {
              callback: (
                value: number | string,
                _index: number,
                _ticks: Tick[]
              ): string => {
                const crValue = Number(value) / 1e7; // Convert to crores
                return Number(crValue.toFixed(2)) + " CR"; // Two significant digits
              },
            }
          : undefined,
      },
      x: { title: { display: true, text: "Month" } },
    },
  };

  const growthAllTeams = getGrowth(
    allTeamsData["2024-2025"],
    allTeamsData["2023-2024"]
  );

  // Dynamic Pie Chart Data
  const getPieChartData = (year: "2024-2025" | "2023-2024") => {
    const teamValues =
      viewMode === "month"
        ? Object.fromEntries(
            Object.entries(teamData).map(([team, data]) => [
              team,
              data[year][januaryIndex],
            ])
          )
        : teamContributions[year];

    return {
      labels: Object.keys(teamValues),
      datasets: [
        {
          data: Object.values(teamValues),
          backgroundColor: [
            "#3b82f6",
            "#ef4444",
            "#10b981",
            "#f59e0b",
            "#8b5cf6",
          ],
        },
      ],
    };
  };

  const pieChartData2024 = getPieChartData("2024-2025");
  const pieChartData2023 = getPieChartData("2023-2024");

  // Pie Chart Options (team name and percentage inside for desktop, hover only for mobile)
  const pieChartOptions = {
    plugins: {
      legend: { position: "right" as const },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return `Collection: ${value.toLocaleString()} CR`;
          },
        },
      },
      datalabels: {
        display: !isMobile, // Show only on desktop
        color: "#000", // Black text
        textAlign: "center" as const,
        font: { size: 10, weight: "bold" as const }, // Smaller font size, bold
        formatter: (value: number, context: any) => {
          const total = context.dataset.data.reduce(
            (sum: number, val: number) => sum + val,
            0
          );
          const percentage = ((value / total) * 100).toFixed(1);
          const label = context.chart.data.labels[context.dataIndex];
          return `${label}\n${percentage}%`;
        },
      },
    },
  };

  // Team-specific Chart Data
  const teamCharts = Object.entries(teamData).map(([team, data]) => {
    const chartData = {
      labels:
        viewMode === "month"
          ? ["January"]
          : months
              .slice(0, januaryIndex + 1)
              .map((month) => (isMobile ? month.slice(0, 3) : month)),
      datasets: [
        {
          label: "2024-2025",
          data: getChartData(data["2024-2025"]),
          backgroundColor: viewMode === "month" ? "#3b82f6" : undefined,
          borderColor: viewMode === "upto" ? "#3b82f6" : "#3b82f6",
          fill: false,
          pointRadius: viewMode === "month" ? 0 : 5,
          pointHoverRadius: viewMode === "month" ? 0 : 7,
        },
        {
          label: "2023-2024",
          data: getChartData(data["2023-2024"]),
          backgroundColor: viewMode === "month" ? "#ef4444" : undefined,
          borderColor: viewMode === "upto" ? "#ef4444" : "#ef4444",
          fill: false,
          pointRadius: viewMode === "month" ? 0 : 5,
          pointHoverRadius: viewMode === "month" ? 0 : 7,
        },
      ],
    };
    const growth = getGrowth(data["2024-2025"], data["2023-2024"]);
    return { team, chartData, growth };
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
      {/* Navbar */}
      <nav className="bg-blue-900 text-white p-4 shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold">
            Revenue Report 2024-25
          </h1>
          <div className="space-x-2 md:space-x-4 mt-2 md:mt-0">
            <button
              onClick={() => setViewMode("raw")}
              className={`px-2 py-1 md:px-4 md:py-2 rounded transition text-sm md:text-base ${
                viewMode === "raw"
                  ? "bg-blue-800"
                  : "bg-blue-700 hover:bg-blue-600"
              }`}
            >
              Raw Data
            </button>
            <button
              onClick={() => setViewMode("upto")}
              className={`px-2 py-1 md:px-4 md:py-2 rounded transition text-sm md:text-base ${
                viewMode === "upto"
                  ? "bg-blue-800"
                  : "bg-blue-700 hover:bg-blue-600"
              }`}
            >
              Upto January
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-2 py-1 md:px-4 md:py-2 rounded transition text-sm md:text-base ${
                viewMode === "month"
                  ? "bg-blue-800"
                  : "bg-blue-700 hover:bg-blue-600"
              }`}
            >
              January
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-6 flex-grow">
        {viewMode === "raw" ? (
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-lg md:text-2xl font-semibold mb-4 text-center">
              {rawData.title}
            </h2>
            {rawData.teams.map((team, idx) => (
              <div key={idx} className="mb-6 md:mb-8">
                <h3 className="text-base md:text-xl font-bold mb-2">
                  {team.name}
                </h3>
                <table className="w-full text-xs md:text-sm border-collapse">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="border p-1 md:p-2">ক্রম</th>
                      <th className="border p-1 md:p-2">
                        উৎস কর কর্তনকারী কর্তৃপক্ষ
                      </th>
                      {months.map((month) => (
                        <th key={month} className="border p-1 md:p-2">
                          {isMobile ? month.slice(0, 3) : month}
                        </th>
                      ))}
                      <th className="border p-1 md:p-2">ক্রমযোজিত (২০২৪-২৫)</th>
                      <th className="border p-1 md:p-2">
                        ক্রমযোজিত (২০২৩-২০২৪)
                      </th>
                      <th className="border p-1 md:p-2">প্রবৃদ্ধি</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.authorities.map((auth, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="border p-1 md:p-2 text-center">
                          {i + 1}
                        </td>
                        <td className="border p-1 md:p-2">{auth.name}</td>
                        {auth.values.map((value, j) => (
                          <td key={j} className="border p-1 md:p-2 text-right">
                            {value.toLocaleString()}
                          </td>
                        ))}
                        <td className="border p-1 md:p-2 text-right">
                          {auth.cumulative2024.toLocaleString()}
                        </td>
                        <td className="border p-1 md:p-2 text-right">
                          {auth.cumulative2023.toLocaleString()}
                        </td>
                        <td className="border p-1 md:p-2 text-right">
                          {auth.growth}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto md:overflow-x-hidden">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-semibold mb-4">
                All Teams Collection (CR)
              </h2>
              <div className="relative w-full min-w-[600px] md:min-w-0">
                {viewMode === "month" ? (
                  <Bar data={allTeamsChartData} options={barChartOptions} />
                ) : (
                  <Line data={allTeamsChartData} options={lineChartOptions} />
                )}
                <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-gray-800 text-white p-1 md:p-2 rounded text-xs md:text-base">
                  Growth: {growthAllTeams}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
                <h2 className="text-base md:text-xl font-semibold mb-4">
                  Team Contribution 2024-25 (%)
                </h2>
                <div className="w-full min-w-[300px] md:min-w-0">
                  <Pie data={pieChartData2024} options={pieChartOptions} />
                </div>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
                <h2 className="text-base md:text-xl font-semibold mb-4">
                  Team Contribution 2023-24 (%)
                </h2>
                <div className="w-full min-w-[300px] md:min-w-0">
                  <Pie data={pieChartData2023} options={pieChartOptions} />
                </div>
              </div>
            </div>

            {teamCharts.map(({ team, chartData, growth }) => (
              <div
                key={team}
                className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-4 md:mb-6"
              >
                <h2 className="text-base md:text-xl font-semibold mb-4">
                  {team} Collection (CR)
                </h2>
                <div className="relative w-full min-w-[600px] md:min-w-0">
                  {viewMode === "month" ? (
                    <Bar data={chartData} options={barChartOptions} />
                  ) : (
                    <Line data={chartData} options={lineChartOptions} />
                  )}
                  <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-gray-800 text-white p-1 md:p-2 rounded text-xs md:text-base">
                    Growth: {growth}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white p-4">
        <div className="container mx-auto text-center">
          <p className="text-sm md:text-base">
            © 2025 Revenue Report | Designed with React, Tailwind CSS, and
            TypeScript
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
