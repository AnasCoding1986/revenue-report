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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [chartKey, setChartKey] = useState(0); // For forcing chart re-render

  const lastMonthIndex = months.indexOf("January");
  const januaryIndex = months.indexOf("January");

  // Detect mobile view and apply theme
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      setChartKey((prev) => prev + 1); // Force chart re-render on resize
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev: boolean) => !prev);
  };

  // Get chart data based on view mode
  const getChartData = (data: number[]) => {
    if (viewMode === "month") {
      return [data[januaryIndex]];
    }
    const cumulative = getCumulativeData(data);
    return viewMode === "upto"
      ? cumulative.slice(0, januaryIndex + 1)
      : cumulative;
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
    layout: {
      padding: { top: 40 }, // Space for growth indicator
    },
    scales: {
      y: {
        title: {
          display: !isMobile,
          text: "Collection (CR)",
          color: isDarkMode ? "#fff" : "#000",
        },
        ticks: {
          color: isDarkMode ? "#fff" : "#000",
          maxTicksLimit: isMobile ? 10 : undefined, // More ticks on mobile for clarity
          ...(isMobile && {
            callback: (
              value: number | string,
              _index: number,
              _ticks: Tick[]
            ): string => {
              const crValue = Number(value) / 1e7;
              return `${Number(crValue.toFixed(2))}\nCR`;
            },
          }),
        },
        grid: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Months",
          color: isDarkMode ? "#fff" : "#000",
        },
        ticks: { color: isDarkMode ? "#fff" : "#000" },
        grid: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
    maintainAspectRatio: !isMobile,
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
        title: {
          display: true,
          text: "Collection (CR)",
          color: isDarkMode ? "#fff" : "#000",
        },
        ticks: {
          color: isDarkMode ? "#fff" : "#000",
          ...(isMobile && {
            callback: (
              value: number | string,
              _index: number,
              _ticks: Tick[]
            ): string => {
              const crValue = Number(value) / 1e7;
              return Number(crValue.toFixed(2)) + " CR";
            },
          }),
        },
        grid: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Month",
          color: isDarkMode ? "#fff" : "#000",
        },
        ticks: { color: isDarkMode ? "#fff" : "#000" },
        grid: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
    maintainAspectRatio: !isMobile,
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

  // Pie Chart Options
  const pieChartOptions = {
    plugins: {
      legend: {
        position: "right" as const,
        labels: { color: isDarkMode ? "#fff" : "#000" },
      },
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
        display: !isMobile,
        color: "#000",
        textAlign: "center" as const,
        font: { size: 10, weight: "bold" as const },
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
    maintainAspectRatio: !isMobile,
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
    <div
      className={`min-h-screen flex flex-col ${
        isDarkMode ? "dark bg-gray-900" : "bg-gray-100"
      } font-sans`}
    >
      {/* Navbar */}
      <nav className="bg-blue-900 dark:bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold">
            Revenue Report 2024-25
          </h1>
          <div className="flex space-x-2 md:space-x-4 mt-2 md:mt-0 items-center">
            <button
              onClick={() => setViewMode("raw")}
              className={`px-2 py-1 md:px-4 md:py-2 rounded transition text-sm md:text-base ${
                viewMode === "raw"
                  ? "bg-blue-800 dark:bg-gray-700"
                  : "bg-blue-700 dark:bg-gray-600 hover:bg-blue-600 dark:hover:bg-gray-500"
              }`}
            >
              Raw Data
            </button>
            <button
              onClick={() => setViewMode("upto")}
              className={`px-2 py-1 md:px-4 md:py-2 rounded transition text-sm md:text-base ${
                viewMode === "upto"
                  ? "bg-blue-800 dark:bg-gray-700"
                  : "bg-blue-700 dark:bg-gray-600 hover:bg-blue-600 dark:hover:bg-gray-500"
              }`}
            >
              Upto January
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-2 py-1 md:px-4 md:py-2 rounded transition text-sm md:text-base ${
                viewMode === "month"
                  ? "bg-blue-8s00 dark:bg-gray-700"
                  : "bg-blue-700 dark:bg-gray-600 hover:bg-blue-600 dark:hover:bg-gray-500"
              }`}
            >
              January
            </button>
            <button
              onClick={toggleDarkMode}
              className="px-2 py-1 md:px-4 md:py-2 rounded transition text-white bg-gray-700 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-500 text-sm md:text-base"
            >
              {isDarkMode ? "☀" : "☾"}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-6 flex-grow">
        <h1
          className={`text-2xl md:text-3xl font-semibold text-center mb-4 ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          Taxes zone- Sylhet TDS report
        </h1>
        {viewMode === "raw" ? (
          <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md overflow-x-auto text-black dark:text-white">
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
                    <tr className="bg-blue-100 dark:bg-gray-700">
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
                      <tr
                        key={i}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
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
          <div className="overflow-x-hidden">
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md mb-4 md:mb-6 text-black dark:text-white">
              <h2 className="text-lg md:text-2xl font-semibold mb-4">
                All Teams Collection (CR)
              </h2>
              <div
                className="relative w-full"
                style={{ height: isMobile ? "300px" : undefined }}
              >
                {viewMode === "month" ? (
                  <Bar
                    key={`bar-${chartKey}`}
                    data={allTeamsChartData}
                    options={barChartOptions}
                  />
                ) : (
                  <Line
                    key={`line-${chartKey}`}
                    data={allTeamsChartData}
                    options={lineChartOptions}
                  />
                )}
                <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-gray-800 dark:bg-gray-700 text-white p-1 md:p-2 rounded text-xs md:text-base">
                  Growth: {growthAllTeams}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
              <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md text-black dark:text-white">
                <h2 className="text-base md:text-xl font-semibold mb-4">
                  Team Contribution 2024-25 (%)
                </h2>
                <div className="w-full">
                  <Pie
                    key={`pie1-${chartKey}`}
                    data={pieChartData2024}
                    options={pieChartOptions}
                  />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md text-black dark:text-white">
                <h2 className="text-base md:text-xl font-semibold mb-4">
                  Team Contribution 2023-24 (%)
                </h2>
                <div className="w-full">
                  <Pie
                    key={`pie2-${chartKey}`}
                    data={pieChartData2023}
                    options={pieChartOptions}
                  />
                </div>
              </div>
            </div>

            {teamCharts.map(({ team, chartData, growth }) => (
              <div
                key={team}
                className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md mb-4 md:mb-6 text-black dark:text-white"
              >
                <h2 className="text-base md:text-xl font-semibold mb-4">
                  {team} Collection (CR)
                </h2>
                <div
                  className="relative w-full"
                  style={{ height: isMobile ? "300px" : undefined }}
                >
                  {viewMode === "month" ? (
                    <Bar
                      key={`bar-${team}-${chartKey}`}
                      data={chartData}
                      options={barChartOptions}
                    />
                  ) : (
                    <Line
                      key={`line-${team}-${chartKey}`}
                      data={chartData}
                      options={lineChartOptions}
                    />
                  )}
                  <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-gray-800 dark:bg-gray-700 text-white p-1 md:p-2 rounded text-xs md:text-base">
                    Growth: {growth}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 dark:bg-gray-800 text-white p-4">
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
