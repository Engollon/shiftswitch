<script>
//import {onMount} from 'svelte'
//import {shifts,swaps} from '../preferances'
//import {pb,currentUser} from '../pocketbase'
//(employee.username="${$currentUser.username}"||"${$currentUser.username}"="Tout") && filter:`
//           dateStart>="${new Date($renderDate.setMonth($renderDate.getMonth())).toISOString()}"&&
//           dateEnd<="${new Date($renderDate.setMonth($renderDate.getMonth()+1)).toISOString()}"`
/*async function update(){
    const resultList=await pb.collection('shifts').getFullList({
        sort:'dateStart',
        expand:'employee',
    }); 
    const record = await pb.collection('users').getOne(pb.authStore.model.id, {}); 
    $shifts=resultList;
    console.log($shifts);
    $shifts.forEach((shift,indexed) => {
        if(shift != null){
            if(shift.swap && $currentUser.id!=shift.expand?.employee?.id &&new Date(shift.dateStart) >= new Date()){
                $swaps.push(shift);
            }
        }
   })

    $dispos=Object.values(record.availiblity);
}

pb.authStore.onChange((auth)=>{
    currentUser.set(pb.authStore.model);
    if(pb.authStore.model!=null){
        //update();
    }else{
        //logout
    }
})
//onMount(()=>{
    //update()
//})
*/
</script>
