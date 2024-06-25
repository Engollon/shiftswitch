<script>
      import { writable } from 'svelte/store';
      import {pb,currentUser} from './pocketbase';
      import {renderDate} from './preferances'
      import DispoButton from './DispoButton.svelte';
      import {onMount} from 'svelte';
     
      export const ava=writable([]);
      pb.autoCancellation(false);
      let c1;
      let c2;
      let days = [];
      onMount(async () =>{
        const record = await pb.collection('users').getOne($currentUser.id, {fields:"availiblity"}); 
        if(record!=null){
          //console.log(record.availiblity);
          $ava=Object.values(record.availiblity);
          //console.log($ava);
        }
      })
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
  function updateDispolist(date){
    if($ava.includes(date)){
        $ava=$ava.filter((item) => item !== date);
      }else{
        $ava=[...$ava,date];
      }
  }
  async function updateDispo(e){
    let date=e.detail[0]
    let ev=e.detail[1]

    if(ev.ctrlKey){
      if(!c1 && !c2){
        c1=date
        updateDispolist(date)
      }else if(c1 && !c2){
        c2=date
        updateDispolist(date)
        let d1= new Date(c1)
        let d2= new Date(c2)
        if(d1.getTime() < d2.getTime()){
          var start = d1;
          var end = d2;
          var tmp = new Date(start);
          while(tmp < end){          
            var newDate = tmp.setDate(tmp.getDate() + 1);
            tmp= new Date(newDate);
            let fdate = tmp.toISOString().split('T')[0];
            if(!$ava.includes(fdate)){
              $ava = [...$ava, fdate];
            }
          }
        }
        c1=false;
        c2=false;
      }
    }else{
      updateDispolist(date)
      c1=false;
      c2=false;
    }
      let json = JSON.stringify($ava);
      const record = await pb.collection('users').update($currentUser.id,  {"availiblity": json});
  }
 
  </script>
    <div>
      <div class="calendar-grid">
        {#each days as day}
        <DispoButton  on:dateSelected={updateDispo} day={day} ava={ava}/>
        {/each}
      </div>
    </div>
   
    <style>
  
        .day{
            font-size: medium;
            color: black;
            display: flex;
            align-items: center;
            background-color:white;
            border-radius: 8px;
            padding: 5px;
            margin-bottom: 5px;
        }
        .title{
            text-align: center;
        }
        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 2px;
            margin:2px;
        }
        .month{
            font-size: 10px;
            text-align: center;
        }
       
      .button {
        background-color: #3498db; 
        color: white;
        border: none;
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
      }
      .group{
        margin-top: 5px;
      }
    </style>
    