<script> 
    import {hideOthers,renderDate,shifts,swapMsg,takeMsg,MainC,BackC} from './preferances'
    import {currentUser,pb,isAdmin} from './pocketbase'
    import {onMount,onDestroy} from 'svelte';
    export let shiftsByDate;
    export let days;
      async function swap(selectedItemId){
        if(confirm($currentUser.id == selectedItemId.expand?.employee?.id?$swapMsg + "\n" +new Date(selectedItemId.dateStart).toLocaleDateString('default') +" - "+selectedItemId.location:$takeMsg+ "\n" +new Date(selectedItemId.dateStart).toLocaleDateString('default')+" - "+selectedItemId.location )){
          if($currentUser.id == selectedItemId.expand?.employee?.id){
            selectedItemId.swap=!selectedItemId.swap;
            if(selectedItemId.swap){
                // add 1 to swap ask for the GB who ask for a swap
                const record2 =await pb.collection('users').getOne(selectedItemId.expand?.employee?.id,{"fields":"swapAsk"});
                await pb.collection('users').update(selectedItemId.expand?.employee?.id, {"swapAsk":record2.swapAsk+1});
            }else{
                // remove 1 to swap ask for the GB who ask for a swap no more
                const record2 =await pb.collection('users').getOne(selectedItemId.expand?.employee?.id,{"fields":"swapAsk"});
                await pb.collection('users').update(selectedItemId.expand?.employee?.id, {"swapAsk":record2.swapAsk-1});
            }
          }else{
              // add one to swapTake for the orginal GB and add one to swapTake for the remplacant(currentuser)
              const record = await pb.collection('users').getOne($currentUser.id,{"fields":"swapTake"});
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
    async function cancel(selectedItemId){
      //change the canceled status
        if(confirm("Voulez-vous vraiment changer le status de cet horaire?")){
          //set status to opposite
          selectedItemId.canceled=!selectedItemId.canceled
          const record = await pb.collection('users').getOne(selectedItemId.expand?.employee?.id,{"fields":"numcanceled"});
    
          if(selectedItemId.canceled){
            //add one to the personell cancel list.
            await pb.collection('users').update(selectedItemId.expand?.employee?.id, {"numcanceled": record.numcanceled+1});
          }else{
            //remove one to the personell cancel list.
            await pb.collection('users').update(selectedItemId.expand?.employee?.id,{"numcanceled": record.numcanceled-1});
          }
        }
        const data = {
            "canceled" : selectedItemId.canceled
          };
          await pb.collection('shifts').update(selectedItemId.id,data);
    }
    let weekday = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

    function poolletters(pool){
      if (pool== "Engollon"){
        return "Engollon"
      }
      if (pool== "GSC"){
        return "GSC"
      }
      if (pool== "Fontenelle"){
        return "Fontenelle"
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
                <div class={shift.swap? (shift.canceled? "shift swap red":"shift swap"):(shift.canceled?"shift red" :"shift")}>
                  <div class="datasec" on:click={()=>swap(shift)}>
                    <div class="name">{shift.expand?.employee?.username}</div>
                    <div class="loc">{poolletters(shift.location)} | {shift.type}</div>
                    <div class="loc">{new Date(shift.dateStart).getHours()}h{new Date(shift.dateStart).getMinutes()}-{new Date(shift.dateEnd).getHours()}h{new Date(shift.dateEnd).getMinutes()}</div>
                  </div>
                  <div>
                    {#if $isAdmin}
                        <div on:click={()=>cancel(shift)}>{shift.canceled?'✔️':'❌'}</div>
                      {/if}
                    </div>
                </div>
            {:else}
              <div class={(shift.swap && !swapcheck(shift))? (shift.canceled? "shift swap red":"shift swap"):(shift.canceled?"shift noswap red" :"shift noswap")} >
                <div class="datasec" on:click={() => {if (shift.swap && !swapcheck(shift)){swap(shift)}}}>
                <div class="name">{shift.expand?.employee?.username}</div>
                <div class="loc">{poolletters(shift.location)} | {shift.type}</div>
                <div class="loc">{new Date(shift.dateStart).getHours()}h{new Date(shift.dateStart).getMinutes()}-{new Date(shift.dateEnd).getHours()}h{new Date(shift.dateEnd).getMinutes()}</div>
              </div>
              <div>
                {#if $isAdmin}
                    <div on:click={()=>cancel(shift)}>{shift.canceled?'✔️':'❌'}</div>
                  {/if}
                </div>
              </div>
            {/if}
          {:else}
            <div class="{shift.canceled?'shift past lightred':'shift past '}">
              <div>
              <div class="name"> {shift.expand?.employee?.username}</div>
              <div class="loc">{poolletters(shift.location)} | {shift.type}</div>
              <div class="loc">{new Date(shift.dateStart).getHours()}h{new Date(shift.dateStart).getMinutes()}-{new Date(shift.dateEnd).getHours()}h{new Date(shift.dateEnd).getMinutes()}</div>
              </div>
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
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      font-size: medium;
      display: flex;
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
      display: flex;
      flex-direction: row;
      justify-content: space-between;
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
    .datasec{
    flex-grow: 1;
    }
    .red{
      background-color: red;
      border-color: red;
      color: white;
    }
    .lightred{
      border: 1px solid red ;
    }
    
  
    
  </style>
  