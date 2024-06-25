<script>
    import {onMount,onDestroy} from 'svelte';
    import {currentUser,pb} from './pocketbase';
    import Scroll from './Scroll.svelte';
    import Grid from './Grid.svelte';
    import Settings from './Settings.svelte';
    import {useGrid,hideOthers,renderDate,settings,shifts} from './preferances'
    onMount(async () =>{
        $shifts=await pb.collection('shifts').getFullList({
            sort:'dateStart',
            expand:'employee',
        });
    })
    let startDate
    let days = [];
    $:{
        days=[]
        let startDate = new Date($renderDate.getFullYear(), $renderDate.getMonth());
        while (startDate.getDay()!=2){
          startDate.setDate(startDate.getDate()-1);
          days.unshift(new Date(startDate).toISOString().split('T')[0]);
        }
        const currentDate =new Date($renderDate.getFullYear(), $renderDate.getMonth());
        // Include days of the current month
        while (currentDate.getMonth() == $renderDate.getMonth()) {
          days.push(new Date(currentDate).toISOString().split('T')[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }
        while (currentDate.getDay()!=1){
          days.push(new Date(currentDate).toISOString().split('T')[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }
        days.push(new Date(currentDate).toISOString().split('T')[0]);
    }
    //dict with shifts keyed by day
    let shiftsByDate = {};
    $:{
      startDate= new Date(days[0])
       shiftsByDate = {};
        for (const shift of Object.values($shifts)) {
          if (($hideOthers && shift.expand?.employee?.username == $currentUser.username) || !$hideOthers) {
              //console.log(shift.expand?.employee?.username,shift.dateStart,"/",new Date($renderDate.getFullYear(), $renderDate.getMonth() + 1, 1))
            if (startDate <= new Date(shift.dateStart) && new Date(shift.dateStart) <= new Date($renderDate.getFullYear(), $renderDate.getMonth() + 1, 1)){
              const day = new Date(shift.dateStart).toISOString().split('T')[0];
              if (!shiftsByDate.hasOwnProperty(day)){
                shiftsByDate[day] = [shift];
              } else {
                shiftsByDate[day].push(shift);
              }
            }
          }
        }
    }
</script>
{#if !$settings && !$useGrid}
  <Scroll {shiftsByDate}/>
{:else if $useGrid && !$settings}
  <Grid {shiftsByDate} {days}/>
{:else}
    <Settings/>
{/if}

