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
    TimeScale,
    BarController,
    BarElement
  } from "chart.js";

  import "chartjs-adapter-date-fns";
  import { writable } from "svelte/store";
  import { supabase } from "./supabaseClient";
  import { onDestroy } from "svelte";

  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    TimeScale,
    BarController,
    BarElement
  );

  // --- State ---
  let currentDay = writable(new Date());
  let events = writable([]);
  let subscription;

  // --- Chart Data ---
  $: data = {
  datasets: [
    // 1️⃣ Line chart (cumulative count)
    {
      type: "line",
      label: "Éntrées (cumulatif)",
      data: (() => {
        let count = 0;
        return $events.map(e => {
          count++;
          return { x: new Date(e.created_at), y: count };
        });
      })(),
      borderColor: "steelblue",
      backgroundColor: "rgba(70,130,180,0.2)",
      showLine: true,
      tension: 0.2,
      pointRadius: 3,
      yAxisID: "y", // use left y-axis
    },

    // 2️⃣ Bar chart (events per hour)
    {
      type: "bar",
      label: "Éntrées par heure",
      data: (() => {
        // Count how many events per hour (8–20h)
        const counts = {};
        for (let h = 8; h <= 20; h++) {
          counts[h] = 0;
        }
        $events.forEach(e => {
          const d = new Date(e.created_at);
          const h = d.getHours();
          if (h >= 8 && h <= 20) {
            counts[h]++;
          }
        });

        // Build dataset as bar values at each hour
        return Object.entries(counts).map(([hour, count]) => {
          const d = new Date($currentDay);
          d.setHours(hour, 0, 0, 0);
          return { x: d, y: count };
        });
      })(),
      backgroundColor: "rgba(255, 165, 0, 0.4)", // orange bars
      borderColor: "orange",
      borderWidth: 1,
      yAxisID: "y", // use same y-axis
    }
  ]
};

  // --- Chart Options ---
  $: options = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 0   // disable animation
  },
  plugins: {
    legend: { display: true },
  },
  scales: {
    x: {
      type: "time",
      time: {
        unit: "hour",
        tooltipFormat: "HH:mm",
        displayFormats: { hour: "HH:mm" }   // <-- force 24h
      },
      title: { display: true, text: "Heure", color: "#fff" },
      min: (() => {
        const d = new Date($currentDay);
        d.setHours(8, 0, 0, 0);
        return d;
      })(),
      max: (() => {
        const d = new Date($currentDay);
        d.setHours(20, 0, 0, 0);
        return d;
      })(),
      ticks: {
        color: "#fff",
        callback: function (value) {
          const date = new Date(value);
          return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          });
        }
      }
    },
    y: {
      title: {
        display: true,
        text: "Nombre d'entrées",
        color: "#fff"
      },
      ticks: { color: "#fff" },
      beginAtZero: true
    }
  }
};


  // --- Fetch Events from Supabase ---
  async function loadEvents(day) {
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);

    const { data: eventsData, error } = await supabase
      .from("button_presses")
      .select("*")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase fetch error:", error);
      events.set([]);
    } else {
      //console.log("Fetched events for", day.toDateString(), eventsData);
      const localEvents = eventsData.filter(e => {
        const d = new Date(e.created_at);
        const h = d.getHours();
        return h >= 8 && h <= 20;
      });
      events.set(localEvents);
    }
  }

  // --- Subscribe to Realtime Updates ---
  currentDay.subscribe(async day => {
    await loadEvents(day);

    // remove old subscription if switching days
    if (subscription) {
      await supabase.removeChannel(subscription);
    }

    // subscribe for new events
    subscription = supabase
      .channel("button_presses_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "button_presses" },
        payload => {
          const newEvent = payload.new;
          const d = new Date(newEvent.created_at);
          const h = d.getHours();
          const isSameDay = d.toDateString() === day.toDateString();
          if (isSameDay && h >= 8 && h <= 20) {
            events.update(evts => [...evts, newEvent]);
          }
        }
      )
      .subscribe();
  });

  onDestroy(() => {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  });

  // --- Day navigation ---
  function prevDay() {
    currentDay.update(d => {
      const newDay = new Date(d);
      newDay.setDate(d.getDate() - 1);
      return newDay;
    });
  }

  function nextDay() {
    currentDay.update(d => {
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
    align-items: center;
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
  <button on:click={prevDay}>&lt; Jour Prècedent</button>
  <div style="text-align: center;">
    <span class="date-label">{$currentDay.toDateString()}</span>
    <br />
    <small>Total Journalier: {$events.length}</small>
  </div>
  <button on:click={nextDay}>Jour Suivant &gt;</button>
</div>

<div style="height: 300px; width: 100%;">
  <Chart type="line" {data} {options} />
</div>
