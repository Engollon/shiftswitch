import {pb,isAdmin,currentUser} from './pocketbase';
import {seasonstart,seasonend,n,N,T} from './preferances'
import Pbar from './Actions.svelte';
import Dispo from './Dispo.svelte';
export async function shiftGen(){
    //call the wanted function and preform preation:
    //Delete old shifts
    await deleteshifts();
    console.log("Generating shifts...");
    //Generate new shifts
    let shifts= await simpleGen();
    console.log("Uploading shifts...");
    //Upload the new shifts
    await uploadShifts(shifts);
    console.log("Done shifts...");
    //uploadShifts(shifts);
    return shifts;
}
async function deleteshifts(){
    if (confirm('Etes-vous sûr de voulouir effacer tout les horaires?')) {
        const records = await pb.collection('shifts').getFullList({
            sort: '-created',
            fields:'id',
            filter:'location="Engollon"'
        });
        T.set('Deleting shifts...');
        N.set(records.length);
        n.set(0);
        for (const record of records){
            await pb.collection('shifts').delete(record.id);
            //await new Promise(resolve => setTimeout(resolve, 1000));
            n.update(value => value + 1);
        }
    }
}
//Simple Shift generation function
async function simpleGen(){
    T.set('Generating shifts...');
    /*
    Get data of the form:
    availiblity: Array(6) [ "2024-08-26", "2024-08-27", "2024-08-28", … ]
    id: "bbz8dfz161e9tni"
    jours: 120
    username: "Matias"
    -> id (to set a new shift), jours (the wanted "hours"),username (not useful),dispos(an array of avaible dates).
    */
    let data= await pb.collection('users').getFullList({
        fields: 'availiblity,username,jours,id'
    });

    //format the data:
    //1) Create the dict with dispos for each day
    let Dispos={};
    let startDate= new Date(2024, 4, 18);// first day with shift
    let endDate=new Date(2024,8 ,8);// last day with shift
    
    for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
        let date = currentDate.toISOString().split('T')[0];
        let resArray = [];
        //find all GB who are availble for date
        data.forEach(obj => {
            if (obj.availiblity && obj.availiblity.includes(date)) {
            resArray.push(obj.id);
            }
        });
        Dispos[date]=resArray;
        
    }
    //console.log(Dispos);
    //Returns:
    //"2024-05-17":[ "Marine" ]

    //2) Create the dict for GB
    let GBs={};
    data.forEach(obj => {
        GBs[obj.id]={ 
            username:obj.username,
            days:0,
            dayswanted:obj.jours,
            streak:0
        }
    });
    /*
    Returns this:
    6ofilwvrhfqhiyp: Object { username: "Elia", days: 0, dayswanted: 0, … }
    8omcfm0wt09wqw2: Object { username: "Carole", days: 0, dayswanted: 0, … }
    bbz8dfz161e9tni: Object { username: "Matias", days: 0, dayswanted: 120, … }
    */

    //Shift Assignment logic
    let shifts={};
    N.set(Dispos.length);
    n.set(0);
    for (const key in Dispos) {
        shifts[key] = getGB(Dispos[key],GBs);
        n.update(value => value + 1);
    }
    console.log("sgen",shifts);
    return shifts;
}

//Returns subset of  available GBs
function getGB(IDs,GBs) {
    let res=[];
    IDs.forEach(GB=>{
        if(GBs[GB].streak<4 && GBs[GB].days<GBs[GB].dayswanted){
            res.push(GB)
            GBs[GB].days+=1; //Add one to the total days worked
            GBs[GB].streak+=1; //Add one to the streak (#days worked in a row)
        };
    })

    //reset the streak of all GBs not working
    for (const key in GBs) {
        if (!res.includes(key)) {
          GBs[key].streak = 0;
        }
      }
    return res;
   
}
async function uploadShifts(shifts){
    T.set('Uploading shifts...');
    //for each shift in shifts, upload the data
    // requiered data is:id of GB/date (star and end time are mostly for other pools)
    console.log(shifts);
    N.set(Object.values(shifts).reduce((total, arr) => total + arr.length, 0));
    n.set(0);
    for (let key in shifts){
        if(shifts[key]){    
            for(let shift of shifts[key]){ 
                const data = {
                    "dateStart":new Date(new Date(key).setHours(9)),
                    "dateEnd": new Date(new Date(key).setHours(20)),
                    "employee": shift,
                    "swap": false,
                    "location": "Engollon"
                };
                try{
                    await pb.collection('shifts').create(data);
                }catch(e){
                    console.log(e,data)
                    T.set("Erreur");
                }
                n.update(value => value + 1);
            }
        }
        
    }


}


//Generates random shhifts
async function genrandom(data){
    let amount=50;
    const startDate = new Date(2024, 4, 18 , 0, 0, 0, 0);  
    const endDate = new Date(2024,8 ,8 , 0, 0, 0, 0);    
    //generates random data for testing purouses
    let res=[];
    
    for(let i=0;i<amount;i++){
        let date=getRandomDate(startDate, endDate);
        let obj={
            "employee":data[Math.floor(Math.random() * data.length)].id,
            "dateStart":new Date(date.setHours(8, 0, 0, 0)),
            "dateEnd": new Date(date.setHours(20, 0, 0, 0)),
            "swap": Math.random() < 0.1,
            "location": "Engollon"
        }
        console.log(obj)
        const record = await pb.collection('shifts').create(obj);
        res.push(res);
    }
    return res;
}
function getRandomDate(startDate, endDate) {
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
  
    const randomTimestamp = startDateTime.getTime() + Math.random() * (endDateTime.getTime() - startDateTime.getTime());
    const randomDate = new Date(randomTimestamp);
  
    return randomDate;
  }
