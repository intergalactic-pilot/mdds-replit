import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';

const width = 800;
const height = 500;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white' });

export interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}

export interface ScatterPlotData {
  datasets: {
    label: string;
    data: { x: number; y: number }[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface BoxPlotData {
  labels: string[];
  datasets: {
    label: string;
    data: number[][];
  }[];
}

export async function generateBarChart(data: BarChartData, title: string): Promise<Buffer> {
  const configuration: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: data.datasets.map(ds => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: ds.backgroundColor || 'rgba(54, 162, 235, 0.6)',
        borderColor: ds.borderColor || 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }))
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Value'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Groups'
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

export async function generateScatterPlot(data: ScatterPlotData, title: string, xLabel: string, yLabel: string): Promise<Buffer> {
  const configuration: ChartConfiguration = {
    type: 'scatter',
    data: {
      datasets: data.datasets.map(ds => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: ds.backgroundColor || 'rgba(255, 99, 132, 0.6)',
        borderColor: ds.borderColor || 'rgba(255, 99, 132, 1)',
        pointRadius: 5,
        pointHoverRadius: 7
      }))
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          title: {
            display: true,
            text: xLabel
          }
        },
        y: {
          title: {
            display: true,
            text: yLabel
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

export async function generateLineChart(data: BarChartData, title: string): Promise<Buffer> {
  const configuration: ChartConfiguration = {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: data.datasets.map(ds => ({
        label: ds.label,
        data: ds.data,
        borderColor: ds.borderColor || 'rgba(75, 192, 192, 1)',
        backgroundColor: ds.backgroundColor || 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        fill: false,
        tension: 0.1
      }))
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Value'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Categories'
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

export async function generateGroupedBarChart(data: BarChartData, title: string, yLabel: string): Promise<Buffer> {
  const configuration: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: data.datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: ds.backgroundColor || `hsla(${i * 60}, 70%, 60%, 0.6)`,
        borderColor: ds.borderColor || `hsla(${i * 60}, 70%, 60%, 1)`,
        borderWidth: 1
      }))
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: yLabel
          }
        },
        x: {
          title: {
            display: true,
            text: 'Groups'
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}
