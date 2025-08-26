<script>
  import { Chart } from 'svelte-chartjs';
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale
  } from 'chart.js';

  // Register Chart.js components once
  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale
  );

  // Data passed in from parent
  export let myData = [];

  // Labels for x-axis
  $: labels = myData.map((_, i) => i + 1);

  // Chart.js data object (reactive: updates when myData changes)
  $: data = {
    labels,
    datasets: [
      {
        label: 'My Data',
        data: myData,
        borderColor: 'steelblue',
        backgroundColor: 'rgba(70, 130, 180, 0.2)',
        fill: true,
        tension: 0.3, // smooth curve
        pointRadius: 4,
      }
    ]
  };

  // Chart options
  let options = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'Simple Line Chart' }
    }
  };
</script>

<Chart type="line" {data} {options} />
