<script>
export let day
export let ava;
import { createEventDispatcher } from "svelte";
import {seasonstart,seasonend,renderDate} from './preferances'
const dispatch = createEventDispatcher();

function select(e) {
    let ev=[day,e];
    dispatch("dateSelected", ev);
}

function isinSeason(date){
    if (new Date(day)>=new Date($renderDate.getFullYear(),$seasonstart[1]-1,$seasonstart[0]) && new Date(day)<new Date($renderDate.getFullYear(),$seasonend[1]-1,$seasonend[0]+1)){
        return true;
    }
    return false;
}

</script>
{#if isinSeason(day)}
    <div class={$ava.includes(day)? "day selected":"day"} on:click={select}>{new Date(day).getDate()}</div>
{:else}
    <div class="offseason">{new Date(day).getDate()}</div>
{/if}
<style>
     .day{
            font-size: medium;
            display: flex;
            align-items: center;
            background-color: #444444;
            border-radius: 2px;
            padding: 5px;
            justify-content: center;
            cursor: pointer;
            user-select: none;
        }
        .offseason{
            background-color: #444444;
            opacity: 0.4;
            font-size: medium;
            display: flex;
            align-items: center;
            border-radius: 2px;
            padding: 5px;
            justify-content: center;
            user-select: none;
        }
        .selected{
            background-color: rgb(217, 87, 6);
        }  
</style>