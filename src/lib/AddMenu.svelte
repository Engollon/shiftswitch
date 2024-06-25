<script>
//UI elements to allow for uploading shift data form a CSV file
import {pb,isAdmin,currentUser} from './pocketbase';
import {dispos, shifts,seasonend,seasonstart,T,N,n} from './preferances'
let newshifts=[]
let files;
let csvData = [];
let action=false;
let num=0
let tot=0
let btext=""
let typehorarie=false // true if horaire engolon

function handleFileChange(event) {
    files = event.target.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = function(e) {
        const text = e.target.result;
        csvData = processCSV(text);
        console.log(csvData)
        if(typehorarie){ //if engollon horaire
            parseCSV(csvData) 
        }else{
            parseCSVOther(csvData)
        }
        
      };

      reader.readAsText(file);
    }
}
function processCSV(text) {
    // Split the text into an array of lines
    const lines = text.split('\n');
    const data = [];
    lines.forEach(line => {
      const columns = line.split(',');
      // Assuming the first line is the header
      if (data.length === 0) {
        data.push(columns);
      } else {
        // Handle the columns array as needed
        data.push(columns);
      }
    });
    return data;
}
function removeAccents(str) {
    if(str){
        switch (str) {
            case "Chlo�":
                return "Chloe"
            break;
            case "L�anne":
                return "Leanne"
            break;
            case "Fran�ois":
                return "Francois"
            break;
            case "Lo�c":
                return "Loic"
            break;
            default:
                return str[0].toUpperCase() + str.slice(1);
    }
    }else{
        return ""
    }
}
function parseCSV(csvData) {
    newshifts=[]
    let result = csvData.map(row => row.filter((_, index) => index !== 0));
    //create an array with all the new shifts to add
    for(let date of result.slice(1)){
        //for each day, get the date:
        let day=new Date(date[0]).getDate()
        let month=new Date(date[0]).getMonth()
        let year=new Date(date[0]).getFullYear()
        //add gb based of schedule
        let gb1=removeAccents(String(date[2]))
        let gb2=removeAccents(String(date[3]))
        let gb3=removeAccents(String(date[4]))
        let gb4=removeAccents(String(date[5]))
        let resp=removeAccents(String(date[6]))
        switch (date[1]) {

            //names are normalised to remove accents
                case "A":
                newshifts.push([gb1,new Date(year,month,day,9),new Date(year,month,day,19,30),"GB1"])
                newshifts.push([gb3,new Date(year,month,day,9),new Date(year,month,day,19,30),"GB2"])
                    break;
                case "B":
                newshifts.push([gb1,new Date(year,month,day,9),new Date(year,month,day,19,30),"GB1"])
                newshifts.push([gb3,new Date(year,month,day,9),new Date(year,month,day,19,30),"GB2"])
                newshifts.push([gb4,new Date(year,month,day,11),new Date(year,month,day,19,0),"GB3"])
                    break;
                case "C":
                newshifts.push([gb2,new Date(year,month,day,7),new Date(year,month,day,19,30),"GB1bis"])
                newshifts.push([gb3,new Date(year,month,day,9),new Date(year,month,day,19,30),"GB2"])
                newshifts.push([gb4,new Date(year,month,day,11),new Date(year,month,day,19,0),"GB3"])
                    break;
                case "D":
                newshifts.push([gb2,new Date(year,month,day,7),new Date(year,month,day,19,30),"GB1bis"])
                newshifts.push([gb3,new Date(year,month,day,9),new Date(year,month,day,19,30),"GB2"])
                newshifts.push([gb4,new Date(year,month,day,11),new Date(year,month,day,19,0),"GB3"])
                    break;
                case "E":
                newshifts.push([gb1,new Date(year,month,day,9),new Date(year,month,day,20,30),"GB1"])
                newshifts.push([gb3,new Date(year,month,day,9),new Date(year,month,day,20,30),"GB2"])
                newshifts.push([gb4,new Date(year,month,day,11),new Date(year,month,day,20,30),"GB3"])
                    break;
                case "F":
                newshifts.push([gb2,new Date(year,month,day,7),new Date(year,month,day,20,30),"GB1"])
                newshifts.push([gb3,new Date(year,month,day,9),new Date(year,month,day,20,30),"GB2"])
                newshifts.push([gb4,new Date(year,month,day,11),new Date(year,month,day,20,30),"GB3"])
                    break;
                case "G":
                newshifts.push([gb2,new Date(year,month,day,7),new Date(year,month,day,20,30),"GB1bis"])
                newshifts.push([gb3,new Date(year,month,day,9),new Date(year,month,day,20,30),"GB2"])
                newshifts.push([gb4,new Date(year,month,day,11),new Date(year,month,day,20,30),"GB3"])
                    break;
                default:
                console.log(date[1])
                    
        }
        if(resp!=""){
            newshifts.push([resp,new Date(year,month,day,7),new Date(year,month,day,20,0),"Resp"])
        }else{
            //newshifts.push(["Christophe",new Date(year,month,day,7),new Date(year,month,day,20,0)]) Don't add Christophe
        }
    }
    newshifts.pop()
}
function parseCSVOther(csvData){
    newshifts=[]
    for(let date of csvData.slice(1)){
        let day=new Date(date[0]).getDate()
        let month=new Date(date[0]).getMonth()
        let year=new Date(date[0]).getFullYear()
        let gb=removeAccents(String(date[1]))
        let pool=String(date[2])
        const [hoursS, minutesS] = String(date[3]).split('h');
        const [hoursF, minutesF] = String(date[4]).split('h');
        newshifts.push([gb,new Date(year,month,day,Number(hoursS),Number(minutesS)),new Date(year,month,day,Number(hoursF),Number(minutesF)),"Autre",pool])
                
    }
    newshifts.pop() 
    console.log(newshifts)
}
async function addshifts(){
    let employees = await pb.collection('users').getFullList({sort: '-created',});
    console.log(employees)
    for(let shift of newshifts){
        const data = {
            "dateStart":shift[1],
            "dateEnd": shift[2],
            "employee": employees.find(employee => employee.username==shift[0]).id,
            "swap": false,
            "location": typehorarie?"Engollon":shift[4],
            "type":shift[3]
        };
        try{
            await pb.collection('shifts').create(data);
            console.log(data)
        }catch(e){
            alert("Erreur")
        }
        num+=1
        btext= num +" of "+tot
    }
}
async function addfromCSV(){
    tot=newshifts.length
    //add check and only change different ones
    //todo:
    
    newshifts = newshifts.filter(element => {
        return !$shifts.some(obj => obj.expand.employee.username === element[0]&& (new Date(obj.dateStart).getTime()==element[1].getTime()) && (new Date(obj.dateEnd).getTime()==element[2].getTime()) && obj.location == "Engollon");//)
    });
    console.log(newshifts)
    console.log($shifts)
    
    await addshifts()
    tot=0
    num=0
    btext="Términé"
    newshifts=[]
}
</script>
<div class="section">
    <div class="header">Ajouter un horaire CSV</div>
    <div class="action">
      Pour ajouter des horaires d'un fichier CSV (voir le manuel pour avoir le bon format)
      <input type="file" accept=".csv" on:change={handleFileChange} />
      <div> Horaire Engollon?
      <input type="checkbox" bind:checked={typehorarie}></div>
  </div>
  <div class="action">
    {#each newshifts as shift }
        <div>{shift[0]} - {shift[1].toISOString()} - {shift[2].toISOString()}- {shift[3]}</div>
    {/each}
    {#if newshifts.length!=0}
        	<button class="button" on:click={addfromCSV}>{num>0?btext:"Ajouter ces horaires"}</button>
          <button class="button" on:click={()=>newshifts=[]}>Annuler</button>
    {/if}
    
</div>
</div>

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