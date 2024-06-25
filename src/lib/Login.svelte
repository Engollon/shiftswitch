<script>
    import {currentUser,pb}  from './pocketbase'
    import {imageUrl,version,NN} from './preferances'
    import { onMount } from 'svelte';
    let inputRef;
    onMount(() => {
    inputRef.focus();
    });
    let msg="";
    let username;
    let password;
    async function login(){
        try{
            await pb.collection('users').authWithPassword(username, password);
            const record = await pb.collection('users').getOne($currentUser.id, {});
            imageUrl.set(pb.files.getUrl(record, record.avatar, {'thumb': '100x100'}))
            NN.set(record.NotNoob)
        }catch(err){
            //console.log('signup failed: ' + err.message);
            if (err.message === "Failed to authenticate.") {
                showText("Nom d'utilisateur ou mot de passe invalide. Veuillez reessayer.");
            }else if (err.message === "NetworkError") {
                showText("Pas de connection internet.");
            } else {
                showText(err.message);
            }
        }//catch other errors
    }  
    function showText(text) {
        msg=text;
        setTimeout(() => {
        msg = '';
        }, 5000); 
    }
</script>


<img class="dog" src='dog.png'>
    <div class="container">
        <div class="logo">
            <img src='valderuzlogo.png' alt="Logo">
            <div class="title">ShiftSwitch</div>
        </div>
            <div class="news">Les accents dans les noms me compliquent la vie...</div>
        <div>{$version}</div>
        <form on:submit|preventDefault class="form">
                <div class={msg==""?"msg dspNone":"msg"}>{msg}</div>
            <input placeholder="Nom d'utilisateur: votre nom" type="text" bind:value={username} bind:this={inputRef} class="input"/>
            <input placeholder="Mot de passe: 12345" type="password"bind:value={password} class="input"/>
            <button on:click={login} class="button">Login</button>
        </form>  
    </div>


<style>
    @keyframes pulsate {
        0% { font-size: 16px; } /* Initial font size */
        50% { font-size: 17px; } /* Increase font size */
        100% { font-size: 16px; } /* Back to initial font size */
    }
    .news{
        display: flex;
        min-height: 40px;
        align-items: center;
        animation: pulsate 2s infinite; /* Apply pulsate animation */
    }
   .dog {
    position: absolute;
    top: -73px;
    left: -56px;
    max-width: 100%;
    height: auto;
    transform: rotate(180deg);
}
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh; 
        position: relative;
        z-index: 1;
    }
    .logo{
        display: flex;
        background-color: transparent;
        z-index: 2;
    }
    .logo img {
        width: auto;
        height: 100px;
    }   
    .title{
        color: #D95706; 
        font-size: 100px;
        text-align: center;
    }
   
    .form{
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 50%;
        background-color: transparent;
    }
    .button {
        width: 20%;
        margin-top: 5px;
        background-color: #2d2d2d;
        color: #b7b7b7; 
        border: none;
        border-radius: 2px;
        font-size: 14px;
        cursor: pointer;
        font-family: 'Roboto';
    }
    .button:hover{
        background-color: #b7b7b7;
        color:  #2d2d2d; 
    }
    .input{
        width: 50%;
        margin: 2px;
        padding: 10px;
        border: 0px; 
        border-radius: 2px;
        font-size: 14px;
        background-color: #2d2d2d;
        box-sizing: border-box;
        color: white;
        
    }
    .input::placeholder {
        color: #b7b7b7; 
        font-family: 'Roboto';
    }
    .input:focus{
        outline: none;
        border:2px solid;
        border-color: #b7b7b7;
    }
    .msg{
        color: black;
        background-color: gray;
        margin: 5px;
        border-radius: 2px;
        padding: 5px;
    }
    .dspNone{
        display: none;
    }
    @media only screen and (max-width: 700px) {
        [class*="title"] {
            font-size: 200%;
            display: flex;
            align-items: center;
            }
        [class*="input"] {
            width:100%;
        } 
        [class*="button"] {
            width:50%;
        }     
    }
</style>