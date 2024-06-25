<script>
    import {pb,currentUser} from './pocketbase';
    import {shifts,swapMsg,takeMsg} from './preferances'

    //handles the swap of a shift
    async function swap(selectedItemId){
    if(confirm($currentUser.id == selectedItemId.expand?.employee?.id?$swapMsg + "\n" +new Date(selectedItemId.dateStart).toLocaleDateString('default') +" - "+selectedItemId.location:$takeMsg+ "\n" +new Date(selectedItemId.dateStart).toLocaleDateString('default')+" - "+selectedItemId.location )){
          if($currentUser.id == selectedItemId.expand?.employee?.id){
            selectedItemId.swap=!selectedItemId.swap;
          }else{
            // add one to swapAsk for the orginal GB and add one to swapTake for the remplacant(currentuser)
            const record = await pb.collection('users').getOne($currentUser.id,{"fields":"swapTake"});
            await pb.collection('users').update($currentUser.id, {"swapTake":record.swapTake+1});

            // add 1 to swap ask for the GB who ask for a swap
            const record2 =await pb.collection('users').getOne(selectedItemId.expand?.employee.id,{"fields":"swapAsk"});
            await pb.collection('users').update(selectedItemId.expand?.employee.id, {"swapAsk":record2.swapAsk+1});

            selectedItemId.swap=!selectedItemId.swap;
            selectedItemId.expand.employee=$currentUser;
        }
         //update the shift in the backend with the new user and swap status.
          const data = {
            "employee" : $currentUser.id,
            "swap": selectedItemId.swap,
          };
          await pb.collection('shifts').update(selectedItemId.id,data);
        }
    }
    function swapcheck(sshift){// check if the current user is not working the day of sshift.
        return $shifts.find(shift => shift.expand?.employee.id === $currentUser.id && sshift.dateStart.split(' ')[0]==shift.dateStart.split(' ')[0]);
    }
    </script>
    {#each $shifts as shift} 
        {#if (new Date(shift.dateStart)>=new Date())&&(shift.expand?.employee?.id!=$currentUser.id)&&(shift.swap)&&!swapcheck(shift)}
            <div on:click={()=>swap(shift)}  class="swap_notification">{shift.expand?.employee?.username} a besoin de toi! Peut-tu prendre son horaire le {new Date(shift.dateStart).toLocaleDateString('default')} - {shift.location} ?</div>
        {/if}
    {/each}
    <style>
        .swap_notification{
            background-color: #D95706; 
            border-radius: 2px;
            color: white;
            padding: 5px;
            margin-top: 5px;
            text-align: center;
            cursor: pointer;
        }
    </style>
      
   