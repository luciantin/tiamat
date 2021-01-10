import {store} from "@/store/store";
import {ElementsFactory} from "@/factory/elementsFactory/elementsFactory";

const CreateNewDashboard = function(){
    let newDashboardID;


    return newDashboardID;
}

const CreateNewStuffspace = function (gridID){
    let newStuffspaceID;


    return newStuffspaceID;
}

const CreateNewContainer = function (gridID){
    let elFac = new ElementsFactory();

    let meta = elFac.createMeta({
        title:'New',
        description:'New',
        tags: ['New']
    })

    let firstCnt = elFac.createContainer({
        groupID:[],
        pos:{w:1,h:2,x:1,y:1},
        innerGrid:{rows:2,cols:2},
        groupPos:{},
        meta:meta
    })

    return new Promise((resolve, reject) => {
        store.dispatch('getNewID',{type:'container'}).then(newKey => {

            store.dispatch('getElementByKey',{
                type:'dashboard',
                id:gridID,
                key:'containerID'
            }).then(a=>{
                let IDs = Object.values(a);
                IDs.push(newKey)
                Promise.all([
                    store.dispatch('setElement',{
                        type:'container',
                        id:newKey,
                        val:firstCnt
                    }),
                    store.dispatch('setElementByKey',{
                        type:'dashboard',
                        id:0,
                        key:'containerID',
                        val:IDs
                    }),
                ]).then(values =>{
                    resolve(newKey)
                }).catch(err=>{
                    reject(err)
                })
            })
        })
    })
}


const CreateNewGroup = function (CntID){
    let newGroupID;

    let elFac = new ElementsFactory();

    let meta = elFac.createMeta({
        title:'New',
        description:'New',
        tags: ['New']
    })

    let newGroup = elFac.createGroup({
        sectionID:[],
        meta:meta
    })

    return new Promise((resolve, reject) => {

        store.dispatch('getNewID',{type:'group'}).then(newKey => { // get new group id
            console.log(newKey)
            store.dispatch('setElement',{ // add new group to DB
                type:'group',
                id:newKey,
                val:newGroup
            }).then(a=>{ // update container with new group ID and pos
            console.log(a)
                store.dispatch('getElement',{ // get the latest container data to update it
                    type:'container',
                    id:CntID
                }).then(cnt=>{ // update container with new data
                    console.log(cnt)
                    let tmpCnt = Object.assign({},cnt)
                    let tmpGroupID = Array.from(cnt.groupID);
                    let tmpGroupPos = Object.assign({},cnt.groupPos);
                    tmpGroupID.push(newKey);
                    tmpGroupPos[newKey] = {x:0,y:0,w:1,h:1};

                    tmpCnt.groupID = tmpGroupID;
                    tmpCnt.groupPos = tmpGroupPos;

                    store.dispatch('setElement',{ // push new data
                        type:'container',
                        id:CntID,
                        val:tmpCnt
                    }).then(a=>{
                        console.log(a)
                        resolve(newKey); // resolve with newKey
                    })
                })
            })
        })

    })



    return newGroupID;
}

const CreateNewSection = function (GrpID){
    let newSectionID;


    return newSectionID;
}


export {
    CreateNewContainer,
    CreateNewDashboard,
    CreateNewGroup,
    CreateNewSection,
    CreateNewStuffspace
}