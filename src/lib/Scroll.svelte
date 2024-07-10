<script>
    import {currentUser,pb} from './pocketbase';
    import {hideOthers,poolfilter,renderDate,shifts,swapMsg,takeMsg,BackC} from './preferances'
    export let shiftsByDate;
    async function selected(selectedItemId){
      // when a shift is selected,
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
    function fCap(str) {
        if(str){
          return str.charAt(0).toUpperCase() + str.slice(1);
        }else{
          return str;
        }
      }

  function swapcheck(sshift){
    // checks if the shift is a valid swap (are you already working the same day?) returns true if you don't work
      return !$shifts.find(shift => shift.expand?.employee.id === $currentUser.id && sshift.dateStart.split(' ')[0]==shift.dateStart.split(' ')[0]);
    }
</script>

 <!-- Creates the shift tiles for the scroll view -->
{#each Object.entries(shiftsByDate) as [date, shifts]}
  <!-- If the shift is in the current month -->
  {#if new Date(date).getMonth() == $renderDate.getMonth()}
    {#if shifts.length != 0}
      <div class="scroll_day" style="background-color: {$BackC};">
         <!-- Creates the Day nummber -->
        <div class={new Date().toISOString().split('T')[0] == date.split(' ')[0] ? "date today" : "date"}>
          {new Date(date).getDate()}
        </div>
         <!-- Creates the tiles -->
        <div class="shiftgroup">
          {#each shifts as shift (shift.id)}
            <!-- the shift is current -->
            {#if new Date(shift.dateStart).getTime() >= new Date().getTime()}
              <!-- the shift is not swap -->
              {#if !shift.swap}
                <!-- the shift is yours-->
                {#if shift.expand?.employee.id==$currentUser.id}
                  <div class="shift" on:click={()=>selected(shift)}>
                    <div><div class="name">{fCap(shift.expand?.employee?.username)}</div>
                    <div class="time">
                      ({new Date(shift.dateStart).getHours()}h{new Date(shift.dateStart).getMinutes() === 0 ?"00":new Date(shift.dateStart).getMinutes()} -{new Date(shift.dateEnd).getHours()}h{new Date(shift.dateEnd).getMinutes() === 0 ?"00":new Date(shift.dateEnd).getMinutes()})
                    </div>
                    </div>
                    <div class="loc">{shift.location}</div>
                    <div class="loc">{shift.type}</div>
                  </div>
                  <!-- the shift is not yours -->
                  {:else}
                  <div class="noswap">
                    <div>
                    <div class="name">{fCap(shift.expand?.employee?.username)}</div>
                    <div class="time">
                      ({new Date(shift.dateStart).getHours()}h{new Date(shift.dateStart).getMinutes() === 0 ?"00":new Date(shift.dateStart).getMinutes()} - {new Date(shift.dateEnd).getHours()}h{new Date(shift.dateEnd).getMinutes() === 0 ?"00":new Date(shift.dateEnd).getMinutes()})
                    </div>
                    </div>
                    <div class="loc">{shift.location}</div>
                    <div class="loc">{shift.type}</div>
                  </div>
                  {/if}
                <!-- the shift is a swap -->
                {:else}
                  <!-- the shift is a valid swap or is yours -->
                  {#if swapcheck(shift) || shift.expand?.employee.id==$currentUser.id}
                  <div class="swap" on:click={()=>selected(shift)}>
                    <div>
                    <div class="name">{fCap(shift.expand?.employee?.username)}</div>
                    <div class="time">
                      ({new Date(shift.dateStart).getHours()}h{new Date(shift.dateStart).getMinutes() === 0 ?"00":new Date(shift.dateStart).getMinutes()} - {new Date(shift.dateEnd).getHours()}h{new Date(shift.dateEnd).getMinutes() === 0 ?"00":new Date(shift.dateEnd).getMinutes()})
                    </div>
                    </div>
                    <div class="loc">{shift.location}</div>
                    <div class="loc">{shift.type}</div>
                  </div>
                  <!-- the shift is invalid swap -->
                  {:else}
                    <div class="noswap">
                      <div>
                      <div class="name">{fCap(shift.expand?.employee?.username)}</div>
                      <div class="time">
                        ({new Date(shift.dateStart).getHours()}h{new Date(shift.dateStart).getMinutes() === 0 ?"00":new Date(shift.dateStart).getMinutes()} - {new Date(shift.dateEnd).getHours()}h{new Date(shift.dateEnd).getMinutes() === 0 ?"00":new Date(shift.dateEnd).getMinutes()})
                      </div>
                      </div>
                      <div class="loc">{shift.location}</div>
                      <div class="loc">{shift.type}</div>
                    </div>
                  {/if}
                {/if}
                <!-- the shift is already past -->
                {:else}
                  <div class="shift past">
                    <div>
                    <div class="name">{fCap(shift.expand?.employee?.username)}</div>
                    <div class="time">
                      ({new Date(shift.dateStart).getHours()}h{new Date(shift.dateStart).getMinutes() === 0 ?"00":new Date(shift.dateStart).getMinutes()} - {new Date(shift.dateEnd).getHours()}h{new Date(shift.dateEnd).getMinutes() === 0 ?"00":new Date(shift.dateEnd).getMinutes()})
                    </div>
                    </div>
                    <div class="loc">{shift.location}</div>
                    <div class="loc">{shift.type}</div>
                  </div>
              {/if}
          {/each}
        </div>
      </div>
    {/if}
  {/if}
{/each}

<style>
  .scroll_day {
    display: flex;
    align-items: stretch;
    border-radius: 5px;
    padding: 5px;
    margin-top: 10px;
  }
  .shiftgroup{
    align-items: stretch;
    gap:5px;
    display: flex;
    flex-grow: 1;
    align-content: flex-start;
    font-family: 'Roboto';
    flex-wrap: wrap;
  }
  .date{
    font-size: 35px;
    padding: 10px;
    min-width: 40px;
    height: fit-content;
    text-align: center;
    display: inline-block;
    align-self:center;
  }
  .today{
    color: #D95706;
  }
  
  .shift{
    background-color: white;
    border-radius: 3px;
    color: black;
    flex: 1;
    max-height: 100%;
    padding: 10px;
    align-items: center;
    cursor: pointer;
  }
  .noswap{
    background-color: transparent;
    color: white;
    border: 1px solid white;
    user-select: none;
    cursor: default;
    border-radius: 3px;
    flex: 1;
    max-height: 100%;
    padding: 10px;
    align-items: center;
  }
  .swap{
    background-color:#D95706;
    color: white;
    border-radius: 3px;
    flex: 1;
    max-height: 100%;
    padding: 10px;
    align-items: center;
    cursor: pointer;
  }
  .past{
    background-color: rgb(40, 40, 40);
    color: #444444;
  }
  .name{
    font-size: medium;
  }
  .time{
    font-size: small;
  }
  .loc{
    font-size: small;
  }
  @media only screen and (max-width: 750px) {
  }
  </style>