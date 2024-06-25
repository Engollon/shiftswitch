<script>
    import {useGrid,hideOthers,settings,imageUrl,about} from './preferances'
    let logoUrl = 'valderuzlogo.png';
    let navText = 'ShiftSwitch';
    import {version} from './preferances'
    import {onMount} from 'svelte';
    function toggleHome(){
      settings.set(false);
    }
    onMount(async () =>{
      window.scrollTo(0,0);
    })
  </script>
  
  <nav class="navbar" on:click={toggleHome}>
    <div class="logo">
      <div class="version">{$version}</div>
      <img class="logo_img" src={logoUrl} alt="Logo" />
    </div>
    <div class="nav-text">
      {navText}
    </div>
    
  </nav>
  
  <style>
    .navbar {
      display: flex;
      align-items: center;
      padding: 1rem;
    }
  
    .logo {
      position: relative;
      flex: 1;
      display: flex;
      align-items: center;
    }
    .version{
      position: absolute;
      right: -40px; 
      bottom: 50px;
      font-family: "Space Mono", monospace; 
      font-size: 10px; 
      color: #000000; 
      background-color:white;
      border-radius: 15px;
      padding-left: 2px;
      padding-right: 2px;
      z-index: 2;
      border: solid black 1px;
    }
  
    .logo_img {
      max-width: 50px;
      height: auto;
    }
  
    .nav-text {
      flex: 2;
      font-size: 2.5rem;
      text-align: center;
      padding-left: 5px;
    }
    @media only screen and (max-width: 700px) {
      /* For mobile phones: */
      [class*="nav-text"] {
        display: none;
      }
      [class*="navbar"] {
        flex-direction: column;
      }
      [class*="version"] { 
        position: relative;
        right: 0px; 
        bottom: 0px;
      }
      [class*="logo_img"] { 
        max-width: 40px;
        height: auto;
      }
      [class*="logo"] { 
        flex-direction: column;
      }
    }
  </style>
  