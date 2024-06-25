<script>
    import {currentUser,isAdmin} from './pocketbase';
    import {hideOthers,useGrid,imageUrl,heuresV, N} from './preferances';
    import {pb} from './pocketbase';
    import {onMount} from 'svelte'
    import ChangePassword from './ChangePassword.svelte';
    import Dispo from './Dispo.svelte'
    import AdminPanel from './Admin_panel.svelte';
    import Statistics from './Statistics.svelte';
    import AddMenu from './AddMenu.svelte';
    import Actions from './Actions.svelte';
    import Email from './Email.svelte';
    let email="example@example.com"
      async function toggleGridpref(){
        useGrid.set(!$useGrid);
        const data = {
            "useGrid": !$useGrid
        };
        const record = await pb.collection('users').update($currentUser.id, data);
    }
    onMount(()=>{
        imageUrl.set(pb.files.getUrl($currentUser, $currentUser.avatar, {'thumb': '100x250'}))
        $isAdmin=pb.authStore.model.isAdmin;
        email=$currentUser.email
    });
    async function getImage(){
         const record = await pb.collection('users').getOne($currentUser.id, {});
         imageUrl.set(pb.files.getUrl(record, record.avatar, {'thumb': '100x250'}))
    }
    let selectedFile,fileInput
    let formData = new FormData();
    async function handleFileChange(event) {
        selectedFile = event.target.files[0];
        formData.set('avatar', selectedFile);
        imageUrl.set(URL.createObjectURL(selectedFile));
        const record = await pb.collection('users').update($currentUser.id,{avatar:selectedFile}); 
    }
	let showChangePassword = false
    let closePopup = () => {
        showChangePassword = false;
      };
    let popup = () => {
        showChangePassword = true;
    }
    //
    async function updateemail(){
      try{
        console.log(email.toString())
        //await pb.collection('users').requestEmailChange(email);
        console.log("Updated email")
      }catch(error){
        alert(error.message)
      }
  }
  function notifyMe() {
    Notification.requestPermission().then(perm=>{
      if (perm==="granted"){
        const notif=new Notification("test",{
            body: "Hello"
          })
      }else{
        alert("WTF!?")
      }
    })
  }
</script>

<div class="card">
    <form  title="Changer la photo de profil" enctype="multipart/form-data">
        <img src={$imageUrl? $imageUrl:"nopic.png"} alt="Selected Image" on:click={() => fileInput.click()} class="profilepic"/>
        <input type="file"  name="avatar" accept=".jpg, .jpeg, .png" style="display:none" bind:this={fileInput} on:change={handleFileChange} />
    </form>
    <div class="name"  >{$currentUser.username} </div>
    <div class="name">{$isAdmin?'🔑':''}</div>
    <div class="name">
      <button class="button" title="Changer le mot de passe" on:click={popup}>
          Changer le mot de passe
      </button>
    </div>
        {#if showChangePassword}
            <div class="overlay" on:click={closePopup}></div>
            <ChangePassword onClose={closePopup} />
        {/if}
</div>
<!-- not needed
<div class="dispo">
    <Dispo/>
</div>

<div class="card">
  <div>Email </div>
  <input type="email" bind:value={email}/>
  <button class="button" on:click={updateemail}>
    <button on:click={notifyMe}>Notify me!</button>
    Changer l'email
</button>

</div>
--> 
{#if $isAdmin}
  <AdminPanel/>
  <AddMenu/>
{/if}
<div class="section">
    <div class="header">Actions</div>
    <Actions/>
</div>


<Statistics/>
<style>
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
.con{
    color: white;
    padding: 5px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}
.name{
    font-size: 2rem;
    user-select: none;
}
.settings{
    flex-grow: 1;
}
.dispo{
    flex-grow: 1;
}
.card {
    color: white;
    padding: 5px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
 }
 .toggle{
    background-color: white;
    border: 0px;
    border-radius: 2px;
    color: black;
 }
 .profilepic {
    width: 125px;
    height: auto;
    border-radius: 2px;
    cursor: pointer;
    
 }.overlay {
    background-color: rgba(0, 0, 0, 0.5);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
  }
  .flat-button {
    border: 0px;
    background-color: rgb(255, 255, 255);
    border-radius: 2px;
    font-family: "Roboto";

  }
  .flat-button:hover{
    background-color: rgb(0, 0, 0);
    color: white;
  }
  .subsection{
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 5px;
  }
  @media only screen and (max-width: 700px) {
            [class*="card"] {

            }
            [class*="dispo"] {
                
            }
    }
</style>