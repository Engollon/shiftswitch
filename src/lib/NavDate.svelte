<script>
    let imgsrc='left_arrow.png'
    export let renderDate;

    function nextmonth() {
     renderDate.setMonth(renderDate.getMonth()+1)
     renderDate=renderDate
    }
    function prevmonth() {
     renderDate.setMonth(renderDate.getMonth() -1)
     renderDate=renderDate
    }
    function handleKeyPress(event) {
      if ( event.key === 'ArrowLeft') {
        prevmonth();
      }else if(event.key === 'ArrowRight'){
        nextmonth();
      }
    }

    //class="navbar" for first div to set to middle, but then scroll doesn't work
</script>
 <div class="layout">
   <button title="mois prècedent"  class="toggle-button" on:click={() => prevmonth()}>
       <img src={imgsrc} alt={`Button`} />
   </button>
   <div>
     {renderDate.toLocaleString('fr-CH', { month: 'long'})}
     {renderDate.getFullYear()}
   </div>
   <button  title="Prochain mois" class="toggle-button" on:click={() => nextmonth()}>
       <img class="rot" src={imgsrc} alt={`Button`} />
   </button>
</div>
<svelte:window on:keydown={handleKeyPress} />
<style>
 .toggle-button {
   border: none;
   background-color: transparent;
   line-height: 0px;
   margin-left: 5px;
   margin-right: 5px;
   }

 .toggle-button img {
   width: 10px;
   height: auto;
 }
 .rot{
   transform: rotate(180deg);
 }
 .layout{
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: 8px;
   background-color:#444444;
 }
</style>
