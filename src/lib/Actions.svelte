<meta charset="ISO-8859-1"> 
<script>
   
import { jsPDF } from "jspdf";
import {dispos, shifts,seasonend,seasonstart,T,N,n} from './preferances'
import autoTable from 'jspdf-autotable'
import {pb,isAdmin,currentUser} from './pocketbase';
let pdfContent = "";
let src = ""; // Define the src variable
let iframe;  
let res
let num=0
let tot=0
let btext=""
let action=false;
async function refresh(){
    const resultList=await pb.collection('shifts').getFullList({
        sort:'dateStart',
        expand:'employee',
    }); 
    $shifts=resultList;
}
async function generatePDF(data){
    var doc = new jsPDF();
    doc.setFontSize(25);
    doc.setFont('roboto','bold');
    doc.text("Horaires GB", 105, 10, null,"center");
    var columns = ['Date', 'GB 1', 'GB 2', 'GB 3', 'GB 4'];
   // let data = {};
      //  for (const shift of Object.values($shifts)) {
         //     const day = new Date(shift.dateStart).toISOString().split('T')[0];
           //   if (!data.hasOwnProperty(day)) {
            //    data[day] = [shift.expand?.employee?.username];
           //   } else {
           //     data[day].push(shift.expand?.employee?.username);
           //   }
       // }
    const tb = [];
    let GBs= await pb.collection('users').getFullList({
        fields: 'username,id'
    });
    for (const date in data) {
        let tmp=[];
        tmp.push(date);
        data[date].forEach(employee => {
            employee=GBs.find(emp=>emp.id==employee);
            tmp.push(employee.username);
        });
        tb.push(tmp)
    }   
    doc.setFontSize(10);
    doc.setFont('roboto','bold');
    autoTable(doc, {
        head: [columns],
        body: tb,
    })
    
    //const tableData = [];
    // Prepare table data
    //for (const date in data) {
       // let tmp=[];
      //  tmp.push(date);
       // for(let i=0;i<data[date].length;i++) {
       //     tmp.push(data[date][i]);
       // }
       // tableData.push(tmp)
   // }
    //console.log(tableData)
    //console.log(tb)
    // Add a table to the pdf using jsPDF Autotable plugin
   // doc.setFontSize(10);
    //doc.setFont('roboto','bold');
    //doc.text("Horaires GB",100,25);
    //doc.text("Table 2",10,10);
    //autoTable(doc, {
    //    head: [columns],
   //     body: tableData,
   // })

    pdfContent = doc.output("datauristring");
    src = pdfContent;
    // Save the pdf
    //doc.save('Shifts.pdf');
}
async function deleteshifts(){
    if (confirm('Etes-vous sûr de voulouir éffacer tout les horaires?')) {
        const records = await pb.collection('shifts').getFullList({
            sort: '-created',
            fields:'id',
            filter:'location="Engollon"'
        });
        tot+=records.length
        for (const record of records){
            await pb.collection('shifts').delete(record.id);
            //console.log("shift deleted");
            num+=1
            btext= num +" of "+tot
            //add progress feedback
        }
    }
}
async function printshifts(onlyme){
    const records = await pb.collection('shifts').getFullList({
            sort: 'dateStart',
            expand:'employee',
            fields:'dateStart,dateEnd,swap,location,expand'
    });
    
    const pdfDoc = new jsPDF();
    pdfDoc.setFontSize(10);
    if(onlyme){
        pdfDoc.text($currentUser.username+" | Horaire | "+new Date().toLocaleDateString('default'), 105, 10, null,"center");
    }else{
        pdfDoc.text("Horaires | "+new Date().toLocaleDateString('default'), 105, 10, null,"center");
    }
   
    const headers=['Date' ,'Garde-Bain' ,'Piscine',' Heure'];
    const tableData=[];
    for (const record of records) {
        if( new Date(record.dateStart).getTime() >= new Date().getTime() && ((onlyme && record.expand?.employee?.id==$currentUser.id) || !onlyme)) {
            tableData.push([ new Date(record.dateStart).toLocaleDateString('default'), record.expand?.employee?.username, record.location,new Date(record.dateStart).getHours()+"h -"+new Date(record.dateEnd).getHours()+"h"]);
        }
    }
   
    autoTable(pdfDoc, {
        startY: 15,
        head: [headers],
        body: tableData,
        headStyles: {
            fillColor: [217, 87, 6], // Set header background color
            textColor: 255, // Set header text color
            fontStyle: 'bold' // Set header font style
        }
    })

    if(onlyme){
        pdfDoc.save($currentUser.username+"_Horaire_" +  new Date().toLocaleDateString('default')+'.pdf');
    }else{
        pdfDoc.save("Horaires_" +  new Date().toLocaleDateString('default')+'.pdf');
    }
    /*
    const pdfDataUri = pdfDoc.output('datauristring');
    window.open(pdfDataUri, '_blank');
    const fileName = 'Horaires.pdf';
    window.document.title = fileName;
    */
}
async function resetstats() {
    if(confirm("Voulez vous vraiment remettre à zero les statistiques")){
        const data = {
            "swapAsk": 0,
            "swapTake": 0,
            "numcanceled": 0
        };
        const gbs = await pb.collection('users').getFullList({});
        for(const gb of gbs){
            await pb.collection('users').update(gb.id, data);
            //console.log(gb.username,gb.id)
        }
    }
}
function sub(){
    pb.collection('shifts').subscribe('*', function (e) {
        if(e.action=="update"){//if a shift was updated
        $shifts=$shifts.map(obj => (obj.id === e.record.id ? { ...obj, ...e.record } : obj));
        }else if(e.action=='delete'){//if a shift was deleted
        $shifts=$shifts.filter(obj => obj.id !== e.record.id);
        }else if(e.action=='create'){//if a shift was created
        $shifts=[...$shifts, e.record]; // not working
        // console.log($shifts);
        }else{
        // console.log("other",e.action,e.record);
        }
        //console.log(e.action,e.record);
        //refresh(); rate limiting
    });
}
</script>
<div class="subsection">
        <button class="button" on:click={()=>printshifts(true)}>Horaire personnel</button>
    {#if $isAdmin}
        <button class="button" on:click={()=>printshifts(false)}> Horaire général</button>
        <button class="button" on:click={()=>resetstats()}> Réinisatliser les statistiques</button>
    {/if}
    </div>
{#if pdfContent}
    <iframe title="PDF Preview" {src} bind:this={iframe} ></iframe>
{/if}

<style>
    .subsection{
        display: grid;
        grid-template-columns:  repeat(auto-fit, minmax(200px,1fr));
        gap: 5px;
        margin-top: 5px;
    }
    iframe {
      width: 100%;
      height: 500px;
    }

    .button{
        background-color: #D95706;
        color: white;
        border: none;
        padding: 0.5rem;
        flex-grow: 1;
        border-radius: 5px;
        font-family: 'Roboto',"Helvetica";
    }
    .button:hover{
        background-color: white;
        color: black;
    }
    .button:active{
        background-color: black;
        color: white;
    }
    .act{
        background-color: rgb(255, 0, 0);
        color: black;
    }
    .action{
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap :5px;
        padding: 5px;
        margin-top: 5px;
        border: 2px solid rgb(40, 40, 40);
        border-radius: 5px;
        text-align: center;
    }
    .dual{
        display: flex;
        gap: 3px;
        flex-wrap: wrap;
    }
  </style>