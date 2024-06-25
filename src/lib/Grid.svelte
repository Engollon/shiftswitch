<script> 
    import {hideOthers,renderDate,shifts,swapMsg,takeMsg,MainC,BackC} from './preferances'
    import {currentUser,pb} from './pocketbase'
    import {onMount,onDestroy} from 'svelte';
    export let shiftsByDate;
    export let days;
      async function swap(selectedItemId){
        if(confirm($currentUser.id == selectedItemId.expand?.employee?.id?$swapMsg + "\n" +new Date(selectedItemId.dateStart).toLocaleDateString('default') +" - "+selectedItemId.location:$takeMsg+ "\n" +new Date(selectedItemId.dateStart).toLocaleDateString('default')+" - "+selectedItemId.location )){
          if($currentUser.id == selectedItemId.expand?.employee?.id){
            selectedItemId.swap=!selectedItemId.swap;
          }else{
              selectedItemId.swap=!selectedItemId.swap;
              selectedItemId.expand.employee=$currentUser;
          }
          const data = {
            "employee" : $currentUser.id,
            "swap": selectedItemId.swap,
          };
          await pb.collection('shifts').update(selectedItemId.id,data);
        }
      }

      //checks if the current user is already working on the day of the swap. true if he is
      function swapcheck(sshift){
        return $shifts.find(shift => shift.expand?.employee.id === $currentUser.id && sshift.dateStart.split(' ')[0]==shift.dateStart.split(' ')[0]);
      }
    let weekday = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

    function poolletters(pool){
      if (pool== "Engollon"){
        return "E"
      }
      if (pool== "GSC"){
        return "G"
      }
      if (pool== "Fontnelle"){
        return "F"
      }
        

    }
  </script>


  <div class='weekdays' style="background-color: {$BackC};">
    {#each weekday as day}
      <div>{day}</div>
    {/each}
  </div>
  <div class="calendar-grid">
    {#each days as day }
    <div class="calendar-card" style="background-color: {$BackC}">
      <div class={ new Date().toISOString().split('T')[0]==day.split(' ')[0]?"time today":"time"}>{new Date(day).getDate()}</div>
      {#if shiftsByDate[day] && typeof shiftsByDate[day] === 'object' && shiftsByDate[day].length > 0}
        {#each shiftsByDate[day] as shift}
          {#if new Date(day).getTime()>=new Date().getTime()}
            {#if shift.expand?.employee?.username === $currentUser.username}
                <div class={shift.swap? "shift swap":"shift"} on:click={()=>swap(shift)}>
                    <div class="name">{shift.expand?.employee?.username}</div>
                    <div class="loc">{poolletters(shift.location)} | {shift.type}</div>
                    <div class="loc">{new Date(shift.dateStart).getHours()}h{new Date(shift.dateStart).getMinutes()}-{new Date(shift.dateEnd).getHours()}h{new Date(shift.dateEnd).getMinutes()}</div>
                </div>
            {:else}
              <div class={(shift.swap && !swapcheck(shift))? "shift swap":"shift noswap"} on:click={() => {if (shift.swap && !swapcheck(shift)){swap(shift)}}}>
                <div class="name">{shift.expand?.employee?.username}</div>
                <div class="loc">{poolletters(shift.location)} | {shift.type}</div>
                <div class="loc">{new Date(shift.dateStart).getHours()}h{new Date(shift.dateStart).getMinutes()}-{new Date(shift.dateEnd).getHours()}h{new Date(shift.dateEnd).getMinutes()}</div>
              </div>
            {/if}
          {:else}
            <div class="shift past">
              <div class="name"> {shift.expand?.employee?.username}</div>
              <div class="loc">{poolletters(shift.location)} | {shift.type}</div>
              <div class="loc">{new Date(shift.dateStart).getHours()}h{new Date(shift.dateStart).getMinutes()}-{new Date(shift.dateEnd).getHours()}h{new Date(shift.dateEnd).getMinutes()}</div>
            </div>
          {/if}
        {/each}
      {/if}
    </div>
    {/each}
  </div>
  
  <style>
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 5px;
      margin-top:5px;
      margin-bottom:5px;
      justify-items: center;
      width: 100%;
    }
    .calendar-card {
      justify-content: center;
  border-radius: 5px;
  min-height: 5rem;
  padding: 5px; /* Consolidated padding */
  width: 100%; /* Make the card take up the full width of its grid cell */
  box-sizing: border-box;
    }
    .name{
      font-size: medium;
    }
    .time{
      font-size: 15px;
      margin-bottom: 0.1rem;
      margin-top: 0.1rem;
      text-align: center;
    }
    .today{
      color: rgb(217, 87, 6);
    }
    .loc{
      font-size:x-small;
      margin-left: 2px;
      margin-right: 2px;
    }
    .shift{
      font-size: medium;
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color:rgb(255, 255, 255); 
      border: 1px solid white; 
      color: black;
      border-radius: 3px;
      padding: 5px;
      margin-bottom: 5px;
      cursor: pointer;
      
    }
    .noswap{
      background-color: transparent ;
      border: 1px solid white;
      color: white;
      user-select: none;
      cursor: default;
    }
    .swap{
      background-color: #D95706;
      color: white; 
    }
    .past{
      background-color: rgb(40, 40, 40);
      color: #444444;
      border: 1px solid #444444;
    }
    .weekdays{
      font-size: medium;
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 5px;
      margin-top:5px;
      margin-bottom:5px;
      align-items: center;
      border-radius: 2px;
      margin-top: 5px;
      justify-items: center;
      padding:0.2rem;
    }
    
  
    
  </style>
  