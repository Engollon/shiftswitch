<script>
    import {currentUser} from './pocketbase';
    import {shifts,seasonend,seasonstart} from './preferances';
    import {pb} from './pocketbase';
    import {onMount} from 'svelte'
    import ShiftAdmin from './ShiftAdmin.svelte';

    let employee
    let dateStart=new Date(new Date().getFullYear(),$seasonstart[1]-1,$seasonstart[0],11,0).toISOString().slice(0,16);//.toISOString().split('T')[0]
    let dateEnd=new Date(new Date().getFullYear(),$seasonend[1]-1,$seasonend[0],22,0).toISOString().slice(0,16);// add two hours to show the right value in the input
    let swap=false;
    let location
    $: resShifts=[] //array of resulting shifts to display in search results
    let employees=[] //array of employees (for dropdown)
    let msg="" //confirmation mesage

    onMount(async ()=>{ // load the relevant data for the dropdown
        employees = await pb.collection('users').getFullList({sort: '-created',});
    });

    async function addShift(){// create a new shift in the database with the selected parameters
        if(location!="Tout" && employee!="Tout"){
            const record = await pb.collection('users').getFirstListItem(`username="${employee}"`, {});
            const data = {
                "dateStart": new Date(dateStart),
                "dateEnd": new Date(dateEnd),
                "employee":record.id, //employees.find(employee => employee.expand.employee.username ==employee).id,
                "swap": swap,
                "location": location
            };
            await pb.collection('shifts').create(data);
            showText("Horaire ajouté!")
            
        }else{
            showText("Lieu et Gardebains ne peuvent pas etre vide!")
        }
    }
    function showText(text) { //show notification of action for 5s
        msg=text;
        setTimeout(() => {
        msg = '';
        }, 5000); 
    }

    async function getShifts(){//get shifts with search criteria form store.
    /*
        const resultList=await pb.collection('shifts').getFullList({
        sort:'dateStart',
        expand:'employee',
        filter: `(employee.username="${employee}"||"${employee}"="Tout") &&
            swap=${swap} && 
            dateStart>="${convertDate(dateStart)}"&&
            dateEnd<="${convertDate(dateEnd)}"&&
            (location="${location}"|| "${location}"="Tout" )`,
        });
        sshifts=resultList;
    */
        resShifts=[];
        resShifts=$shifts.filter((shift)=> 
        ((shift.location==location ||location=="Tout") && 
        (shift.expand.employee.username==employee ||employee=="Tout") &&
        shift.swap==swap &&
        new Date(shift.dateStart).getTime()>=new Date(dateStart).getTime() &&
        new Date( new Date(shift.dateStart).setHours(0,0,0,0)).getTime()<=new Date(dateEnd).getTime()
        ))
    }
    function convertDate(jsDate) {
        jsDate = new Date(jsDate)
        const year = jsDate.getFullYear();
        const month = String(jsDate.getMonth() + 1).padStart(2, '0');
        const day = String(jsDate.getDate()).padStart(2, '0');
        const hours = String(jsDate.getHours()).padStart(2, '0');
        const minutes = String(jsDate.getMinutes()).padStart(2, '0');
        const seconds = String(jsDate.getSeconds()).padStart(2, '0');
        const milliseconds = String(jsDate.getMilliseconds()).padStart(3, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
    }
    async function deleteShift(shift){// deletes a given shift from the database
        shift=shift.detail.shift;
        if(confirm("Voulez vous vraiment effacer cet horaire:" + "\n" +new Date(shift.dateStart).toLocaleDateString('default') +" - "+shift.expand.employee.username+" - "+shift.location )){
            await pb.collection('shifts').delete(shift.id);
            getShifts();
        }
    }  
</script>

<div class="section">
    <div class="header">Modifier/Ajouter un horaire</div>
    <div class={msg==""?"msg disNone":"msg"}>{msg}</div>
    <div class="subsection">
        <div class="group">
            <div class="icon">📅</div>
            <div>
                <input type="datetime-local" bind:value={dateStart}>
                <input type="datetime-local" bind:value={dateEnd}>
            </div>
        </div>
        <div>
            🛟
            <select bind:value={employee}> 
                <option selected>Tout</option>
                {#each employees as employee}
                    <option>{employee.username}</option>
                {/each}
            </select>
        </div>
        <div> 
            📍
            <select bind:value={location}>
                <option selected>Tout</option>
                <option>Engollon</option>
                <option>GSC</option>
                <option>Fontnelle</option>
            </select> 
        </div>
        <div>
            🔁 <input type="checkbox" bind:checked={swap}></div>
        </div>
    <div class="subsection">
            <div class=buttongroup>
                <button class="button" on:click={getShifts}>Rechercher</button>
                <button class="button" on:click={addShift}>Ajouter</button>
            </div> 
        </div>
        {#each resShifts as shift , index}
                <ShiftAdmin {shift} {employees} swap={shift.swap} employee={shift.expand?.employee.username} location={shift.location} dateEnd={new Date(new Date(shift.dateEnd).setHours(new Date(shift.dateEnd).getHours()+2)).toISOString().substring(0, 16)} dateStart={new Date(new Date(shift.dateStart).setHours(new Date(shift.dateStart).getHours()+2)).toISOString().substring(0, 16)} on:dShift={deleteShift} on:update{getShifts}/>
        {/each}
        {#if resShifts.length!=0}
            <div class="subsection">- {resShifts.length} Résultats -</div>
        {/if}
        
    <div class="section">
        <div class="header">Dev Tools</div>
    </div>            

        
</div>
<style>
.msg{
    text-align: center;
    background-color: #D95706;
    border-radius: 5px;
    color: white;
    margin: 2px;
    padding: 5px;
}
.disNone{
    display: none
}
.group{
        display: flex;
        flex-wrap: nowrap;
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
.icon{
    display: flex;
    margin-right: 4px;
    align-items: center; 
}
  .shift{
    background-color: black;
    color: white;
    margin-top: 5px;
    padding: 5px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
  }
  @media only screen and (max-width: 700px) {
            [class*="card"] {
            display: inline;
            }
            [class*="dispo"] {
                margin-top:1rem;
            }[class*="subsection"] {
                flex-direction: column;
            }
    }
   
</style>