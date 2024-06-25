<script>
    import {useGrid,hideOthers,settings,imageUrl,about} from './preferances'
    import {currentUser,pb} from './pocketbase'
    import {onMount} from 'svelte'
      function toggleLayout(){
        if($settings){
          settings.set(!$settings);
        }
          useGrid.set(!$useGrid);
      }
      function toggleOthers(){
          hideOthers.set(!$hideOthers);
      }
      function toggleSettings(){
         settings.set(!$settings);
      }
      function logout(){
        pb.authStore.clear();
      }
      onMount(()=>{
        imageUrl.set(pb.files.getUrl($currentUser, $currentUser.avatar, {'thumb': '100x250'}))
      });
      async function getImage(){
         //const record = await pb.collection('users').getOne($currentUser.id, {});
         //imageUrl.set(pb.files.getUrl(record, record.avatar, {'thumb': '100x250'}))
         
         //console.log(pb.files.getUrl($currentUser, $currentUser.avatar, {'thumb': '100x250'}))
      }
      function toggleabout (){
      about.set(!$about)
      window.scrollTo(0,0);
  }
    </script>
    <div class="navbar">
    <button title="Aide" on:click={toggleabout} class="toggle-button"><img src="help_2.png"></button>
    <button title={$useGrid?"Scroll":"Calendrier"} on:click={toggleLayout} class="toggle-button grid"><img src={$useGrid?'scroll.png':'grid.png'}/></button>
    <button title={$hideOthers?"Tout les horaires":"Seulement mes horaires"} on:click={toggleOthers} class="toggle-button"><img src={$hideOthers?'single_user.png':'multi_user.png'}/></button>
    <button title="Réglages" on:click={toggleSettings} class="toggle-button"><img src={$imageUrl? $imageUrl:"nopic.png"} class="profilepic"></button>
    <button title="Déconnexion" on:click={logout} class="toggle-button"><img src="logout.png"></button>
  </div>
  <style>
    .navbar {
      display: flex;
      align-items: center;
      padding: 0.5rem;
    }
  
    .toggle-button {
      border: none;
      background-color: transparent;
      line-height: 0px;
    }
    .toggle-button img {
      width: 30px;
      height: auto;
    }
    .profilepic{
       border-radius: 2px;
    }
    .help{
      color:white;
      text-align: center;
      text-decoration: none;
      font-size: 30px;
      cursor: pointer;
      padding-left: 5px;
      padding-right: 5px;
    }
    @media only screen and (max-width: 700px) {
      [class*="grid"] {
          display: none;
        }
    }
  </style>