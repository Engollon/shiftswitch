<script>
//UI elements to allow for uploading shift data form a CSV file
// Logic: validate format
//        get list of each shift
//        display based on non engollon vs engollon
//
import {pb,isAdmin,currentUser} from './pocketbase';
import {dispos, shifts,seasonend,seasonstart,T,N,n} from './preferances'
let newshifts=[]
let files;
let csvData = [];
let header=null;
let action=false;
let num=0
let tot=0
let btext=""

function validate(data){
    if (data[0].includes("Date") &&(data[0].includes("Lieu")||data[0].includes("Lieu\r"))&&data[0].includes("GB 1")&&data[0].includes("Horaire")){
        return true // the file is valid
    }  
    else{
        return false // the file is not valid
    }   
}
function handleFileChange(event) {
    csvData=[]
    newshifts=[]
    files = event.target.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
        const text = e.target.result;
        
        csvData = processCSV(text);
        if (validate(csvData)){
            parseCSV(csvData)
        }else{
             alert("Le fichier n'as pas le bon format!")
        }
      };
      reader.readAsText(file);
    }
}
function processCSV(text) {
    // Split the text into an array of lines
    const lines = text.split('\n');
    const data = [];
    lines.forEach((line, index) => {
        const cleanedLine = line.replace(/\r$/, '');
        const columns = cleanedLine.split(',');
        if (index === 0) {
            header = columns;  // Save the first line to the header variable
            data.push(columns);
        } else {
            if(columns[getindex("Date")]!==""){
                data.push(columns); // Push the rest of the lines to the data array
            }else{
            }
        } 
    });
    data.pop(); //removes the last empt line
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
function getindex(string,array){
    return header.indexOf(string);
}
function parseCSV(csvData) {
    newshifts=[]
    let result = csvData//csvData.map(row => row.filter((_, index) => index !== 0));
    //create an array with all the new shifts to add
    //console.log(result)
    for(let date of result.slice(1)){
        //for each day, get the date:
        let day=date[getindex("Date")].split("/")[0]
        let month=date[getindex("Date")].split("/")[1]
        let year=date[getindex("Date")].split("/")[2]
        if(date[getindex("Lieu")]=="Engollon"){
            //console.log("Date is engollon")
            //add gb based of schedule
            let gb1=removeAccents(String(date[3])) //get index based on first array
            let gb2=removeAccents(String(date[4]))
            let gb3=removeAccents(String(date[5]))
            let gb4=removeAccents(String(date[6]))
            let resp=removeAccents(String(date[7]))
            switch (date[getindex("Horaire")]) {
                //names are normalised to remove accents
                    case "A":
                    newshifts.push([gb1,new Date(year,month-1,day,9),new Date(year,month-1,day,19,30),"GB1","Engollon"])
                    newshifts.push([gb3,new Date(year,month-1,day,9),new Date(year,month-1,day,19,30),"GB2","Engollon"])
                        break;
                    case "B":
                    newshifts.push([gb1,new Date(year,month-1,day,9),new Date(year,month-1,day,19,30),"GB1","Engollon"])
                    newshifts.push([gb3,new Date(year,month-1,day,9),new Date(year,month-1,day,19,30),"GB2","Engollon"])
                    newshifts.push([gb4,new Date(year,month-1,day,11),new Date(year,month-1,day,19,0),"GB3","Engollon"])
                        break;
                    case "C":
                    newshifts.push([gb2,new Date(year,month-1,day,7),new Date(year,month-1,day,19,30),"GB1bis","Engollon"])
                    newshifts.push([gb3,new Date(year,month-1,day,9),new Date(year,month-1,day,19,30),"GB2","Engollon"])
                    newshifts.push([gb4,new Date(year,month-1,day,11),new Date(year,month-1,day,19,0),"GB3","Engollon"])
                        break;
                    case "D":
                    newshifts.push([gb2,new Date(year,month-1,day,7),new Date(year,month-1,day,19,30),"GB1bis","Engollon"])
                    newshifts.push([gb3,new Date(year,month-1,day,9),new Date(year,month-1,day,19,30),"GB2","Engollon"])
                    newshifts.push([gb4,new Date(year,month-1,day,11),new Date(year,month-1,day,19,0),"GB3","Engollon"])
                        break;
                    case "E":
                    newshifts.push([gb1,new Date(year,month-1,day,9),new Date(year,month-1,day,20,30),"GB1","Engollon"])
                    newshifts.push([gb3,new Date(year,month-1,day,9),new Date(year,month-1,day,20,30),"GB2","Engollon"])
                    newshifts.push([gb4,new Date(year,month-1,day,11),new Date(year,month-1,day,20,30),"GB3","Engollon"])
                        break;
                    case "F":
                    newshifts.push([gb2,new Date(year,month-1,day,7),new Date(year,month-1,day,20,30),"GB1","Engollon"])
                    newshifts.push([gb3,new Date(year,month-1,day,9),new Date(year,month-1,day,20,30),"GB2","Engollon"])
                    newshifts.push([gb4,new Date(year,month-1,day,11),new Date(year,month-1,day,20,30),"GB3","Engollon"])
                        break;
                    case "G":
                    newshifts.push([gb2,new Date(year,month-1,day,7),new Date(year,month-1,day,20,30),"GB1bis","Engollon"])
                    newshifts.push([gb3,new Date(year,month-1,day,9),new Date(year,month-1,day,20,30),"GB2","Engollon"])
                    newshifts.push([gb4,new Date(year,month-1,day,11),new Date(year,month-1,day,20,30),"GB3","Engollon"])
                        break;
                    default:
            }
            if(resp!=""){
                newshifts.push([resp,new Date(year,month-1,day,7),new Date(year,month-1,day,20,0),"Resp","Engollon"])
            }else{
                //Christophe is resp
            }
        }else{
            let gb1=removeAccents(String(date[getindex("GB 1")]))
            const [hoursS, minutesS] = String(date[getindex("Horaire")].split('-')[0]).split('h');
            const [hoursF, minutesF] = String(date[getindex("Horaire")].split('-')[1]).split('h');
            let pool=String(date[getindex("Lieu")])
            if(pool=="La Fontenelle"){pool="Fontenelle"}
            newshifts.push([gb1,new Date(year,month-1,day,Number(hoursS),Number(minutesS)),new Date(year,month-1,day,Number(hoursF),Number(minutesF)),"GB1",pool])
        }


    }
   // console.log(newshifts)
}

async function addshifts(){
    let employees = await pb.collection('users').getFullList({sort: '-created',});
    //console.log(employees)
    for(let shift of newshifts){
        const data = {
            "dateStart":shift[1],
            "dateEnd": shift[2],
            "employee": employees.find(employee => employee.username==shift[0]).id,
            "swap": false,
            "location": shift[4],
            "type":shift[3]
        };
        //console.log(data,"DATA")
        try{
            await pb.collection('shifts').create(data);
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
    
    /*newshifts = newshifts.filter(element => {
    return !$shifts.some(obj => obj.expand.employee.username === element[0]&& (new Date(obj.dateStart).getTime()==element[1].getTime()) && (new Date(obj.dateEnd).getTime()==element[2].getTime()) && obj.location == "Engollon");//)
    });
    */
    //console.log(newshifts)
    //console.log($shifts)
    
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
    {#each newshifts as shift }
        <div class="shift">
            <div>{shift[0]}</div> -
            <div>{shift[1]}</div> - 
            <div>{shift[1].toISOString().substring(11,16)}-{shift[2].toISOString().substring(11,16)}</div> - 
            <div>{shift[3]}</div> - 
            <div>{shift[4]}</div>
        </div>
    {/each}
    {#if newshifts.length!=0}
        <div class="buttongroup">
        	<button class="button" on:click={addfromCSV}>{num>0?btext:"Ajouter ces horaires"}</button>
            <button class="button" on:click={()=>newshifts=[]}>Annuler</button>
        </div>
    {/if}
    
</div>
</div>

<style>
    .buttongroup{
        display: flex;
        justify-content: space-around;
        padding: 5px;
        gap:5px;
    }
    .shift{
        background-color:rgb(40, 40, 40);
        border-radius: 8px;
        padding: 8px;
        margin: 5px;
        display: flex;
        justify-content: space-around;
    
    }
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