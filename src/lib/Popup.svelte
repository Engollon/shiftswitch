<script>
  // Popup template with text and yes/no buttons with one action
    export let object;
    export let text
    export let onClose;
    import {pb} from './pocketbase';
    function yesSelected(){
      onClose(true);
    }
    function noSelected(){
      onClose(false);
    }
    let employees=pb.collection('users').getFullList({});
    
</script>
  <div class="popup">
    <div>{text}</div>
    <div>{new Date(object.dateStart).toLocaleDateString('fr-CH')} - {object.location}</div>
    <div class="group">
      <button class="button" on:click={yesSelected}>Remplacer cet horaire</button>
      <button class="button"  on:click={noSelected}>Modifier cet horaire</button>
    </div>
  </div>

  <style>
    .popup {
      background-color:black;
      padding: 20px;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000;
      border-radius: 8px;
      align-items: center;
      display: flex;
      flex-direction: column;
    }
    .button {
      background-color: white; 
      color: black;
      border: none;
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
    }
    .group{
      margin-top: 5px;
    }
  </style>
  