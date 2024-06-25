<script>
import {pb,isAdmin,currentUser} from './pocketbase';
import {seasonstart,seasonend,swapMsg, takeMsg, shifts} from './preferances'


// updates a shift for swap (input is the shift) selectedItemId
export async function updateSwap(){
    console.log($currentUser.username);
    //confirm selection based on identity of the current user
    if(confirm(currentUser == selectedItemId.expand?.employee? swapMsg + "\n" +new Date(selectedItemId.dateStart).toLocaleDateString('default') +" - "+selectedItemId.location:takeMsg+ "\n" +new Date(selectedItemId.dateStart).toLocaleDateString('default')+" - "+selectedItemId.location )){
        // change the swap if it is your shift, change the employee if it is not your shift
        if(currentUser == selectedItemId.expand?.employee){
            selectedItemId.swap=!selectedItemId.swap;
        }else{
            selectedItemId.swap=!selectedItemId.swap;
            selectedItemId.expand.employee=currentUser;
        }
        //update the shift list stored in the store
        /*
        const updatedList = shifts.map(obj => {
            if (obj.id === selectedItemId.id) {
                const updatedObj ={ ...obj, swap: selectedItemId.swap};
                updatedObj.expand.employee.username=currentUser;
                console.log('After:', updatedObj.employee);
                return updatedObj;
            }
            return obj;
        });
        */
        //update the shift in the backend
        //shifts=updatedList;
        const data = {
            "employee" : currentUser,
            "swap": false,
        };
            await pb.collection('shifts').update(selectedItemId.id,data);
           // pb.collection('users').update(currentUser.name,{"swapTake":2,"swapAsk":2});
    }
}


</script>