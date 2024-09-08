<script>
import {useGrid,renderDate,imageUrl,BackC,about,NN,version} from './preferances'
import {pb,currentUser, isAdmin} from './pocketbase';
 function toggleabout (){
    window.scrollTo(0,0);
    about.set(false)
    NN.set(true);
    
    update();
  }
async function update() {
    const record = await pb.collection('users').update($currentUser.id, {"NotNoob": true});
}
function getPic(){
    return pb.files.getUrl($currentUser,$currentUser.avatar, {'thumb': '100x100'});
}
function openPDF() {
    window.open('ShiftSwitchDocumentaion_Admin.pdf', '_blank');
}
// <a href="https://github.com/Engollon/shiftswitch" class="icon" title="Documentaion">🗎</a>
</script>
<div class="header">
    <div class="title"> ShiftSwitch</div>
    <div style="font-family: 'Space Mono', monospace;">{$version}</div>
    <div style="font-family: 'Space Mono', monospace;">Salut {$currentUser.username}!</div>
</div>
<div class="container">
    <div class="para q">
        Utilisateurs -------------------------------------------------------------
    </div>
    <div class="para">
        ShiftSwitch est un site web pour faciliter la gestion des horaires. Les fonctionnalités principales sont :
        <ul>
            <li>La gestion des horaires (calendrier)</li>
            <li>La gestion des remplacements</li>
        </ul>
    </div>
    <div class="para q">
    </div>
    
    <div class="para">
        <div class="subtitle">✅ Profil :</div>
        <ol>
            <li>Connectez-vous à <a href="https://engollon.github.io/shiftswitch/" class="link">https://engollon.github.io/shiftswitch/</a></li>
            <li>Utilisez votre nom et le mot de passe par défaut <span style="color: #D95706;">12345</span></li>
            <li>Sélectionnez votre Profil (Photo de profil en haut à droite). Elle ressemble à ça :</li>
        </ol>
        <div class="c">
            <img src={getPic() ? getPic() : "nopic.png"} class="c"/>
        </div>
        <ol start="4">
            <li>Sélectionnez votre nom et changez votre mot de passe (Quand vous l'oublierez, un administrateur peut le réinitialiser)</li>
            <li>Si vous souhaitez changer votre photo de profil, sélectionnez-la dans votre profil</li>
        </ol>
    </div>
    <div class="para">
        <div class="subtitle">✅ Horaire :</div>
        Une fois que les horaires ont été publiés, il vous sera possible de les voir sur la page d'accueil du site. Il y a deux formats pour afficher les horaires : le format calendrier (gauche) ou Timeline (droite). Ces deux icônes se trouvent en haut à droite et vous permettent d'alterner entre les deux. À côté se trouvent deux autres icônes. Le premier vous permet d'afficher seulement vos horaires (gauche) ou tous les horaires (droite). Le deuxième vous permet de vous déconnecter. Il ressemble à ceci :
        <div class="c">
            <img src={'logout.png'} style="height: 60px;"/>
        </div>
        Le premier icône en haut à droite vous ramènera à cette page :
        <div class="c">
            <img src={'help_2.png'} style="height: 60px;"/>
        </div>
        En dessous se trouve la barre pour sélectionner le mois. Les horaires sont affichés dans la zone en dessous. Vous pouvez utiliser les flèches (gauche et droite) pour changer le mois.
    </div>
    <div class="para">
        <div class="subtitle">✅ Échange :</div>
        Si vous voulez demander un remplacement, il vous suffit de sélectionner l'horaire que vous voulez et de le sélectionner. Une fenêtre apparaîtra pour vous demander confirmation. Si vous êtes sûr, l'horaire deviendra orange. Si un remplaçant est trouvé, votre horaire changera de nom (un horaire a toujours un GB qui en est responsable).
    </div>
    <div class="para">
        Si vous voulez prendre un remplacement, vous verrez les demandes de remplacement en dessous de la barre de navigation. En sélectionnant une demande ou en sélectionnant un horaire orange dans le calendrier, vous pouvez prendre un horaire. Il vous sera directement transféré et vous en serez responsable. Un remplacement ne sera visible que si vous ne travaillez pas ce jour-là.
    </div>
    <div class="para">
        <div class="subtitle">✅ Feedback :</div>
        Si vous découvrez un bug, ou que vous avez du feedback, merci de m'en faire part directement par WhatsApp. Il est aussi possible de demander des nouvelles fonctionnalités si vous pensez à quelque chose qui peut améliorer l'utilisation du site.
    </div>
    
    {#if $currentUser.isAdmin}
        <div class="para q">
            Administrateurs -------------------------------------------------------
        </div>
        <div class="para">
            <div class="subtitle">✅ Le plan :</div>
            Voici le plan pour le fonctionnement du site :
            <ol>
                <li>Les horaire on été mis sûr le site (en utilisant "Ajouter des Horaires (.CSV)" et ensuite "Ajouter ces horaires" une fois un fichier en format .CSV selectioné)</li>
                <li>Avant le début de saison, les GB mettent leurs dispos approximatives dans leur profil.</li>
                <li>L'admin peut à tout moment générer les horaires temporaires. Après une certaine date, les disponibilités sont considérées comme finales et les horaires finaux sont générés et sauvegardés dans la base de données. À partir de ce moment, des horaires peuvent être ajoutés, mais les horaires ne peuvent qu'être enlevés par remplacement.</li>
                <li>Les GB peuvent voir leurs horaires sur le site. S'ils veulent un remplacement, ils peuvent le faire à tout moment. Les horaires sont considérés comme tels : 4 GB/jour toute la saison (date de début et fin à vérifier).</li>
                <li>Si nécessaire, l'admin peut ajouter/modifier/supprimer un horaire à tout moment sans aucune limitation.</li>
                <li>Cette première saison, il sera recommandable de régulièrement télécharger les données du site (dispos et horaires, ces deux fonctionnalités sont disponibles dans les réglages admin) comme ça si un problème survient, les horaires peuvent être repris depuis le PDF.</li>
            </ol>
        </div>
        <div class="para">
            <div class="subtitle">✅ Outils :</div>
            Plusieurs outils sont disponibles pour l'admin pour gérer ce site. Certains sont "simples", d'autres plus complexes mais avec plus de fonctionnalités :
            <ol>
                <li>Ce site est le premier outil. Il permet une gestion des horaires et la modification de certains paramètres. L'admin peut toujours manuellement modifier un horaire depuis ici.</li>
                <li><a href="https://shiftswitch.pockethost.io/_/#/collections?collectionId=_pb_users_auth_&filter=&sort=-created" class="link">Pocketbase</a> est utilisé comme "Backend" et gère les données et l'authentification. Depuis le panneau de contrôle de Pocketbase, il est possible de modifier tous les paramètres et données. S'il est nécessaire d'ajouter un nouveau GB, réinitialiser un mot de passe, ... il faut le faire sur Pocketbase.</li>
                <li><a href="https://github.com/Engollon/shiftswitch" class="link">Github</a> est utilisé pour gérer le code du site et pour distribuer le site. Le site est public sur Github. À cause de cela, il est préférable de ne pas avoir de données sensibles sur le site (Ceci est une précaution, le site est en soi sécurisé).</li>
            </ol>
            Un email pour la piscine existe aussi mais n'est pas très utile. Je peux montrer en détail l'utilisation de ces outils. Mais je serai aussi disponible pour intervenir si besoin.
        </div>
        <div class="para">
            <div class="subtitle">✅ Limitations :</div>
            Ce site a actuellement certaines limitations :
            <ol>
                <li>Que pour Engollon. La génération des horaires ne sera que pour Engollon. Pour les autres piscines, les horaires seront créés manuellement (une fonctionnalité pour ajouter des horaires répétitifs est planifiée).</li>
                <li>Il y a 4 GB par jour (à vérifier). Si c'est un jour moche, l'admin préviendra les GB par WhatsApp. De même, si besoin de renfort, l'appel se fera par WhatsApp (avec la possibilité de créer un nouvel horaire manuellement).</li>
                <li>Aucun contrôle pour remplacement. Il y a actuellement peu de contrôles automatiques qu'un GB ne travaille pas plus de 4 jours de suite (à vérifier). Cette fonctionnalité peut être implémentée (elle n'a pas été implémentée pour laisser de la souplesse si un dépannage "illégal" est nécessaire).</li>
            </ol>
        </div>
    {/if}
    <div class="para c">
        Vous pouvez accéder à plus de documentation, telle qu'un PDF avec des instructions détaillées avec l'icône ci-dessous :
    </div>
    
    <div class="icon" title="Documentaion" on:click={openPDF}>🗎</div>
    
    <div class="para c">
        Cette première saison sera un baptême de feu et permettra de résoudre la majorité des problèmes. Bien entendu, si vous trouvez que ça ne vaut pas la peine et que c'est plus simple de faire à la main, on peut laisser tomber.
    </div>
    <button on:click={toggleabout} class="button">Continuer</button>
    </div>
    






<style>
.icon{
    font-size: 5rem;
    margin: 0.5rem;
    cursor: pointer;
    text-decoration: none;
    color: white;
}.subtitle{
    color: #D95706;
    font-size: 1rem;
    font-weight: bold;
    margin-bottom: 10px;
}
.title {
    text-align: center;
    font-size: 5rem;    
}
.header {
    display: flex;  
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 1rem;
}
.container{
    display: flex;
    align-items: center;
    flex-direction: column;
    min-height: 100vh;
    margin-bottom:3rem;
}
.para{
    margin-top: 0.5rem;
    width: 50%;
    font-family:  Helvetica, sans-serif;
    line-height:1.2rem;
}
@media only screen and (max-width: 700px) {
      [class*="para"] {
        width: 85%;
        }
    [class*="title"] {
        font-size: 2rem;    
    }
    }
.c{
    text-align: center;
    border-radius: 5px;
    margin: 1rem;
}
.q{
    color: #D95706;
    font-size: 1.5rem;
    font-weight: bold;
}
.link{
    color: #D95706;
    text-decoration: none;
  cursor: pointer;
}
.img{
    width:50%;
    height:auto;
    border-radius: 5px;
    
}



</style>