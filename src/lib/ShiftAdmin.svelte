<script>
    import {hideOthers,useGrid,imageUrl,BackC,MainC} from './preferances';
    export let shift 
    export let swap=shift.swap;
    export let employees
    export let      dateEnd //= new Date(new Date(shift.dateEnd).setHours(new Date(shift.dateEnd).getHours()+4))
    export let    dateStart//=new Date(new Date(shift.dateStart).setHours(new Date(shift.dateStart).getHours()+2)).toLocaleString().substring(0, 16);
    export let    employee =shift.expand?.employee.username;
    export let    location =shift.location;
    import {pb} from './pocketbase';
    import {onMount} from 'svelte'
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    let locations =["Engollon","GSC","Fontenelle"]
    
    function deleteS(){
        dispatch('dShift',{"shift":shift});
    }
   async function modify(){
            const record1 = await pb.collection('users').getFirstListItem(`username="${employee}"`, {fields: 'id'});
            console.log(record1.id,shift);
            const data = {
                "dateStart": new Date(dateStart),
                "dateEnd": new Date(dateEnd),
                "employee": record1.id,
                "swap": swap,
                "location": location
            };
        //console.log(data)
         await pb.collection('shifts').update(shift.id, data);
        dispatch('update');
    }
</script>
<div class="shift">
        <div class="infoCell">
            🛟
                <select bind:value={employee}> 
                    {#each employees as emp}
                        {#if emp == shift.expand?.employee?.username}
                            <option selected>{emp.username}</option>
                        {:else}
                            <option>{emp.username}</option>
                        {/if}
                    {/each}
                </select>
        </div>  
        <div class="infoCell">
            <div class="group">
            <div> 📅</div>
            <div class="date">
                <input type="datetime-local"  bind:value={dateStart}>
                <input type="datetime-local" bind:value={dateEnd}>
            </div>
        </div>
        </div>
        <div class="infoCell">
            📍 
                <select bind:value={location}>
                    {#each locations as loc }
                        {#if loc == shift.location}
                            <option selected>{loc}</option>
                        {:else}
                            <option>{loc}</option>
                        {/if}
                    {/each}
                </select> 
        </div>
        <div class="infoCell">
            🔁
            <input type="checkbox" bind:checked={swap} on:change={() => modify}>
        </div>
        <div class="infoCell">
        <button on:click={modify} class="button">Modifier</button>
        <button on:click={deleteS} class="button red">Effacer</button>
        </div>
</div>
  

<style>
    .shift{
        background-color: rgb(40, 40, 40);
        color: white;
        border-radius: 3px;
        padding: 5px;
        display: flex;
        justify-content: space-between;
        max-width:inherit;
        margin-top: 5px;
        border-radius: 5px;
        align-items: center;
        gap: 2px;
    }
    .infoCell{
        display:flex;
        gap:5px
    }
    .group{
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        justify-content: center;
    }
    .button{
        background-color: #D95706;
        color: white;
        border: none;
        padding: 0.5rem;
        flex-grow: 1;
        border-radius: 5px;
        font-family: 'Roboto';
        max-width: 5rem;
    }
    .red{
        background-color: rgb(255, 0, 0);
        color: black;
    }
    .button:hover{
        background-color: white;
        color: black;
    }
    .button:active{
        background-color: black;
        color: white;
    }
    @media only screen and (max-width: 750px) {
            [class*="shift"] {
            flex-direction: column;
            justify-content: center;
            }
            [class*="infoCell"] {
                min-width:auto;
                margin-top: 10px;
            }
            [class*="date"]{
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
    }
</style>