<script>
  import {currentUser} from './pocketbase'
    export let onClose;
    let oldPassword 
    let password
    let passwordConfirmation 
    import {pb} from './pocketbase';
    let msg="";

  
    async function yesSelected(){
      try{
        const data = {
        "password": password,
        "passwordConfirm": passwordConfirmation,
        "oldPassword":oldPassword,
        };
        const record = await pb.collection('users').update($currentUser.id, data);
        onClose();
      }catch(err){
        showText(err);
      }
    }
    function showText(err){
      console.log(err.data.data);
          let keys = Object.keys(err.data.data);
          keys.forEach((key, index) => {
            msg += err.data.data[key].message;
            if (index < keys.length - 1) {
              msg += '\n';
            }
          });
          console.log(msg);
          setTimeout(() => {
          msg = '';
          }, 5000); 
    }
  </script>
  
  <div class="popup">
   
    <div >Changer le mot de passe:</div>
    <div class="group-flex">
        <input placeholder="Ancien mot de passe" type="password" bind:value={oldPassword} class="input"/>
        <input placeholder="Nouveau mot de passe" type="password"bind:value={password} class="input"/>
        <input placeholder="Confirmer le mot de passe" type="password"bind:value={passwordConfirmation} class="input"/>
    </div>
    <div class={msg==""?"msg dspNone":"msg"}>{msg}</div>
    <div class="group">
      <button class="button"  on:click={yesSelected}>Confirmer</button>
    </div>
  </div>
  
  <style>
    .popup {
      background-color:rgb(40, 40, 40);
      padding: 20px;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000;
      border-radius: 2px;
      align-items: center;
      display: flex;
      flex-direction: column;
      border: #D95706 1px solid;
    }
    
    .group-flex{
      display:flex;
      flex-direction: column;
      margin-top: 5px;
      gap: 2px;
    }
    .group{
      margin-top: 5px;
      display: flex;
      gap: 10px;
    }
    .input{
      padding: 5px;
      width: 12rem;
    }
    .msg{
        color: black;
        background-color: gray;
        margin: 5px;
        border-radius: 2px;
        padding: 5px;
        white-space: pre-line;
        text-align: center;
    }
    .dspNone{
        display: none;
    }
  </style>
  