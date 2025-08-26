<script>
  import { Chart } from "svelte-chartjs";
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
  } from "chart.js";

  import { writable } from "svelte/store";

  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale
  );

  // Store for the current day
  let currentDay = writable(new Date());

  // Store for events
  let events = writable([]);

  // Generate time labels 8AM → 8PM
  const generateLabels = () => {
    const labels = [];
    for (let h = 8; h <= 20; h++) {
      labels.push(`${h}:00`);
    }
    return labels;
  };
  const labels = generateLabels();

  // Convert events to counts per hour
  $: dataPoints = labels.map((label) => {
    const hour = parseInt(label.split(":")[0]);
    return $events.filter((e) => e.getHours() === hour).length;
  });

  // Chart.js data
  $: data = {
    labels,
    datasets: [
      {
        label: "Events",
        data: dataPoints,
        borderColor: "steelblue",
        backgroundColor: "rgba(70,130,180,0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  let options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: { display: true, text: "Events Over Time" },
    },
    scales: {
      x: { title: { display: true, text: "Time" } },
      y: { title: { display: true, text: "Number of Events" }, ticks: { stepSize: 1 } },
    },
  };

  // Generate mock events for the given day
  function loadMockData(day) {
    const newEvents = [];
    const eventCount = Math.floor(Math.random() * 15) + 5; // 5–20 events
    for (let i = 0; i < eventCount; i++) {
      const hour = Math.floor(Math.random() * 13) + 8; // 8–20
      const min = Math.floor(Math.random() * 60);
      newEvents.push(new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, min));
    }
    events.set(newEvents);
  }

  // Initialize with today
  currentDay.subscribe((day) => loadMockData(day));

  // Navigate days
  function prevDay() {
    currentDay.update((d) => {
      const newDay = new Date(d);
      newDay.setDate(d.getDate() - 1);
      return newDay;
    });
  }

  function nextDay() {
    currentDay.update((d) => {
      const newDay = new Date(d);
      newDay.setDate(d.getDate() + 1);
      return newDay;
    });
  }
</script>

<style>
  .controls {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  button {
    padding: 5px 10px;
    font-size: 1rem;
  }
  .date-label {
    font-weight: bold;
  }
</style>

<div class="controls">
  <button on:click={prevDay}>&lt; Previous Day</button>
  <span class="date-label">{$currentDay.toDateString()}</span>
  <button on:click={nextDay}>Next Day &gt;</button>
</div>

<div style="height: 300px; width: 100%;">
  <Chart type="line" {data} {options} />
</div>
