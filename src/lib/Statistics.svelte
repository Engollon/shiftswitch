<script>
import {pb} from './pocketbase';
let showStats=false;
let employeeShiftsCount = {};
let employeeDispoCount = {};
let employeeSwapTakeCount = {};
let employeeSwapAskCount = {};
let employees=[];
function show(){
    showStats=!showStats;
    getStats();
}
async function getStats() {
  if (showStats) {
    try {
      const userData = await pb.collection('users').getFullList({ sort: '-created' });
        employees=userData;
        console.log(userData);
      const shiftData = await pb.collection('shifts').getFullList({
        expand: 'employee',
        fields:"expand.employee.username",
      });
      userData.forEach(user => {
        const shifts = shiftData.filter(shift => shift.expand.employee.username === user.username);
        employeeShiftsCount[user.username] = shifts.length;
        if(user.availiblity!=null){
            employeeDispoCount[user.username]=user.availiblity.length;
        }else{
            employeeDispoCount[user.username]=0;
        }
        employeeSwapTakeCount[user.username] = user.swapTake;
        employeeSwapAskCount[user.username] = user.swapAsk;
      });
        employeeShiftsCount = Object.fromEntries(
            Object.entries(employeeShiftsCount).sort(([,a], [,b]) => b - a)
        );
        employeeDispoCount = Object.fromEntries(
            Object.entries(employeeDispoCount).sort(([,a], [,b]) => b - a)
        );
        employeeSwapTakeCount = Object.fromEntries(
            Object.entries(employeeSwapTakeCount).sort(([,a], [,b]) => b - a)
        );
        employeeSwapAskCount = Object.fromEntries(
            Object.entries(employeeSwapAskCount).sort(([,a], [,b]) => b - a)
        );
      
        employeeShiftsCount = Object.fromEntries(
            Object.entries(employeeShiftsCount).slice(0, 4)
        );
        employeeDispoCount = Object.fromEntries(
            Object.entries(employeeDispoCount).slice(0, 4)
        );

        employeeSwapAskCount = Object.fromEntries(
            Object.entries(employeeSwapAskCount).slice(0, 4)
        );
        employeeSwapTakeCount = Object.fromEntries(
            Object.entries(employeeSwapTakeCount).slice(0, 4)
        );
    } catch (error) {
      console.error("Error:", error);
    }
  }
}
function getPic(username){
    let employee = employees.find(emp => emp.username === username);

    if (employee) {
        return pb.files.getUrl(employee,employee.avatar, {'thumb': '100x100'});
    } else {
    // Handle the case where employee with the given username is not found
    return null; // or return a default image URL
    }
}




</script>

<div class="section">
    <div class="header" on:click={show}> Statistiques</div>
    {#if showStats}
    <div class="container">
    <div class="panel">
        <div class="title">Nb de jours sur horaire</div>
        {#each Object.entries(employeeShiftsCount) as [username, shiftCount]}
        <div class="value">
            <img src={ getPic(username)? getPic(username) :"nopic.png"} />
            {username}
            <div class="val"> {shiftCount} </div>
        </div>
        {/each}
    </div>
    <div class="panel">
        <div class="title"> # Jours Dispos</div>
        {#each Object.entries(employeeDispoCount) as [username, dispoCount]}
        <div class="value">
            <img src={ getPic(username)? getPic(username) :"nopic.png"} />
            {username}
            <div class="val"> {dispoCount} </div>
        </div>
        {/each}
    </div>
    <div class="panel">
        <div class="title">Remplacements pris</div>
        {#each Object.entries(employeeSwapTakeCount) as [username, Count]}
        <div class="value">
            <img src={ getPic(username)? getPic(username) :"nopic.png"} />
            {username}
            <div class="val"> {Count} </div>
        </div>
        {/each}
    </div>
    <div class="panel">
        <div class="title">Remplacements demandé</div>
        {#each Object.entries(employeeSwapAskCount) as [username, Count]}
        <div class="value">
            <img src={ getPic(username)? getPic(username) :"nopic.png"} />
            {username}
            <div class="val"> {Count} </div>
        </div>
        {/each}
    </div>
    </div> 
    {/if} 
</div>


<style>
.val{
    background-color: #D95706;
    border-radius: 5px;
    min-width: none;
    font-size: 30px;
    padding: 3px;
}
.value{
    border-radius: 5px;
    display: flex;
    padding: 5px;
    align-items: center;
    justify-content: space-between;
    padding-left: 20px;
    padding-right: 20px;
    margin-top: 5px;
    height: 3rem;
}
.value img{
    width: 50px; /* Set a specific width as needed */
  height: auto;
  aspect-ratio: 1/1;
    border-radius: 5px;
}
.title{
    text-align: center;
    margin-bottom: 0.3rem;
    border: 1px solid white;
    border-radius: 3px;
    padding: 5px;
}
.panel{
    background-color: rgb(40, 40, 40);
    border-radius: 5px;
    padding: 0.3rem;
    flex-grow: 1;
}
.container{
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 5px;
    margin-top: 5px;
}
.section{
    background-color:#444444;
    border-radius: 8px;
    margin-top: 10px;
    padding: 5px;
    justify-content: space-between;
    align-items: center; 
}
.header {
    background-color:rgb(40, 40, 40);
    color:white;
    font-family: 'Roboto';
    border-radius: 5px;
    padding: 5px;
}
.subsection{
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin: 5px;
    gap: 10px;
}
.buttongroup{
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin: 5px;
    gap: 5px;
}

</style>