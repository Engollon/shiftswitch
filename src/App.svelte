<script>
  //href="https://github.com/Engollon/shiftswitch/blob/main/README.md"
  import Scroll from "./lib/Scroll.svelte";
  import Logo from "./lib/Logo.svelte";
  import NavButton from "./lib/NavButton.svelte";
  import NavDate from "./lib/NavDate.svelte";
  import Grid from "./lib/Grid.svelte";
  import Login from "./lib/Login.svelte";
  import Shifts from "./lib/Shifts.svelte";
  import Swaps from "./lib/Swaps.svelte";
  //import Data from "./lib/old/Data.svelte";
  import {useGrid,renderDate,imageUrl,BackC,about,NN,shifts} from './lib/preferances'
  import {currentUser,pb} from './lib/pocketbase'
  import {onMount} from 'svelte'   
  import About from "./lib/About.svelte";


  //when the page is loaded, get all the data (shifts form backend), any modifications will be updated be RSE
  onMount(async ()=>{
    const resultList=await pb.collection('shifts').getFullList({
      sort:'dateStart',
      expand:'employee',
    }); 
    $shifts=resultList;
  });

  //realtime evetents form PB
  pb.collection('shifts').subscribe('*', function (e) {
    if(e.action=="update"){//if a shift was updated
      $shifts=$shifts.map(obj => (obj.id === e.record.id ? { ...obj, ...e.record } : obj));
      if (e.record.swap== true){
        notify(e);
      }
    }else if(e.action=='delete'){//if a shift was deleted
      $shifts=$shifts.filter(obj => obj.id !== e.record.id);
    }else if(e.action=='create'){//if a shift was created
      $shifts=[...$shifts, e.record]; // not working
     // console.log($shifts);
    }else{
     // console.log("other",e.action,e.record);
    }
    //console.log(e.action,e.record);
    //refresh(); rate limiting
  }); // the update only returns the id and not the expand of the employee
  async function refresh(){
    const resultList=await pb.collection('shifts').getFullList({
                sort:'dateStart',
                expand:'employee',
            }); 
            $shifts=resultList;
  }



  async function notify(e){
    const record = await pb.collection('users').getFirstListItem(`id="${e.record.employee}"`, {});
    navigator.serviceWorker.ready.then( reg => { reg.showNotification(`${record.username} a besion d'un remplacement le ${new Date(e.record.dateStart).toLocaleDateString()}!`)});
      Notification.requestPermission().then(perm=>{
      if (perm==="granted"){
        const notif=new Notification("Demande de remplacement ShiftSwitch",{
            body: `${record.username} a besion d'un remplacement le ${new Date(e.record.dateStart).toLocaleDateString()}!`
          });
      }else{
        //user denied permission
      }
    });
    
  }
</script>
{#if $currentUser && !$about}
  <div class="navbar">
    <Logo/>
    <NavButton/>
  </div>
  <NavDate bind:renderDate={$renderDate}/>
  <div class="content">
    <Swaps/>
    <Shifts/>
  </div>
{:else if $currentUser}
  <div class="content">
    <About/>
  </div>
{/if}
{#if !$currentUser}
<Login/>
{/if}
<footer class="footer" style="background-color: {$BackC};">
  <div class="links">Made with 🤍 by  Matias</div>
  <div class="links">© 2024</div>
</footer>


<style>
  .navbar {
    display: flex;
    justify-content: space-between;
    margin: 0%;
  }
  .content{
    margin-left: 10px;
    margin-right: 10px;
    min-height:100vh;
  }
  .footer {
    padding-bottom: 15px;
    margin-top: 1rem;
    height: 10%;
  }
  .links{
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 5px;
    padding: 0.5rem;
  }
</style>