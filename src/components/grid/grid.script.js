
import Container from "@/components/grid/GridBaseElements/Container/Container";
import ContainerMenu from "@/components/grid/GridBaseElements/Container/ContainerMenu";
import Group from "@/components/grid/GridBaseElements/Group/Group";
import GroupMenu from "@/components/grid/GridBaseElements/Group/GroupMenu"; // on right click open menu
import Package from "@/components/grid/GridBaseElements/Package/Package";
import PackageMenu from "@/components/grid/GridBaseElements/Package/PackageMenu";
import Drag from "@/components/grid/GridBaseElements/Common/Drag";

import Button from "@/components/common/Button";

import {makePlaceholderId,makeDragId,wrapId,unwrapId } from "@/components/grid/gridID.factory";
import {isRectangleACollidedWithRectangleB,areRectanglesCollidedWithRectangle} from "@/components/grid/gridCollision.module";
import {CreateNewStuffspace,CreateNewContainer} from "@/components/grid/ElementHelpers/elementCreate";


import {mapActions, mapGetters, mapMutations} from "vuex";



export default {
    name: "Grid",
    components:{
        Container, Group, GroupMenu,Package,Drag,ContainerMenu,PackageMenu,Button},
    props: {
        type:{
            type:String
        },
    },
    data(){
        return{
            gridData: {},
            containers:{},
            groups:{},
            content: {},

            ID:0,
            gridClass:'asd',

            mouseData:{
                hasClicked:false, // was there a click?
                dragId:'',  // id of drag element
                type:'', // group || container
                containerId:'', // <--┐
                groupId:'',  // same but different
                containerKey:'',  // ID is for HTML, key is for JS
                groupKey:'',  // ^^
                mouseUpTarget: '', // == document.getElemetById(mouseData.containerId || -||-.groupId)
                mouseDownTarget: '', // not used
                canBeDropped: false, // should mouseUp move container/group
                prevHoveredOverGroupPlaceholderElement: '',
                prevHoveredOverContainerKey: '',
            },
            tmpContainerData:{
                tmpContainerPos : {},
                placeholderPos : {w:1,h:1,x:1,y:1}, // position of container placeholder
            },


            // Bindig funkcija tako da se lakse promijene kasnije, .. nikada ali ipak....
            makePlaceholderId:makePlaceholderId,
            makeDragId:makeDragId,
            wrapId:wrapId,
            unwrapId:unwrapId,

            isRectangleACollidedWithRectangleB:isRectangleACollidedWithRectangleB,
            areRectanglesCollidedWithRectangle:areRectanglesCollidedWithRectangle,

            CreateNewStuffspace:CreateNewStuffspace,
            CreateNewContainer:CreateNewContainer,

        }
    },
    methods:{
        // refreshTmpContainerPosDic() creates an array of container pos, easier to do areRectanglesCollidedWithRectangle() with just a list/dict
        refreshTmpContainerPosDic(){
            this.tmpContainerData.tmpContainerPos = {};
            for(const cnt in this.containers){
                this.tmpContainerData.tmpContainerPos[cnt] = this.containers[cnt].pos;
            }
        },

        makeGridByRepeat(num){ // used instead of repeat(6,1fr)
            let str = '';
            for(let i = 0; i< num; i++) str += '1fr ';
            return str;
        },

        onGroupMouseDown(event){
            this.mouseData.hasClicked = true; //
            this.mouseData.dragId = event.target.id;
            this.mouseData.type = 'group';

            this.mouseData.groupId = this.mouseData.dragId.substring(5,this.mouseData.dragId.length); //groupId is : <containerKey>+<groupKey>+
            let tmpKeyAr = this.unwrapId(this.mouseData.groupId);
            this.mouseData.containerKey = tmpKeyAr[0];
            this.mouseData.groupKey = tmpKeyAr[1];

            let groupPlaceholderElement = document.getElementById(this.makePlaceholderId([this.mouseData.containerKey]));
            this.mouseData.prevHoveredOverGroupPlaceholderElement = groupPlaceholderElement; // just need a single prevPlaceholder so it doesnt throw error

            this.containers[this.mouseData.containerKey].groupPlaceholderPos.w = this.containers[this.mouseData.containerKey].groupPos[this.mouseData.groupKey].w;
            this.containers[this.mouseData.containerKey].groupPlaceholderPos.h = this.containers[this.mouseData.containerKey].groupPos[this.mouseData.groupKey].h;


            this.mouseData.mouseDownTarget = document.getElementById(this.mouseData.groupId);
            this.mouseData.mouseDownTarget.style.position = 'absolute';
        },

        onContainerMouseDown(event){
            this.mouseData.hasClicked = true; // "unlocks" the mouseMove function
            this.mouseData.dragId = event.target.id; // save id of clicked drag element so we can get the id of the container
            this.mouseData.type = 'container'; // used in mouseMove to know the type
            this.mouseData.containerId = this.mouseData.dragId.substring(5,this.mouseData.dragId.length); // drag elements id : drag+
            // console.log(this.mouseData.containerId)
            this.mouseData.mouseDownTarget = document.getElementById(this.mouseData.containerId);
            this.mouseData.mouseDownTarget.style.position = 'absolute'; // 'unlock' the container so it can be moved
            this.mouseData.containerKey = this.unwrapId(this.mouseData.containerId)[0];
            this.refreshTmpContainerPosDic(); // used for collision detection
            this.tmpContainerData.placeholderPos.w = this.containers[this.mouseData.containerKey].pos.w; // set placeholder w and h to be the same as current dragged elem.
            this.tmpContainerData.placeholderPos.h = this.containers[this.mouseData.containerKey].pos.h;
        },

        mouseMove(event){
            if(!this.mouseData.hasClicked) return;

            let posX = (event.clientX - this.gridData.grid.left);
            let posY = (event.clientY - this.gridData.grid.top);

            this.mouseData.mouseDownTarget.style.left = (posX + 10) + 'px'; // make container follow the cursor
            this.mouseData.mouseDownTarget.style.top = (posY + 10) + 'px';  // adds 10px bcz if not then cursor is always above the dragged element

            if(this.mouseData.type == 'container'){  // if the user is dragging a container element,
                let gridSector = { // smoothing to get better grid snapping while mouseOver, grid sector of cursor
                    // % of grid mouse is in          *          num of Rows/Cols       +1 bcz grid starts from 1
                    x: Math.floor((posX/this.gridData.grid.width) * this.gridData.gridColNum) + 1, // FIXME nes sam zeznuo, prob pobrkao col/row negdje jer radi ok a nebi trebalo
                    y: Math.floor((posY/this.gridData.grid.height) * this.gridData.gridRowNum) + 1
                }
                let currentContainerPos = { // w and h are the same but the x and y are mouse cursor gridSector values
                    x: gridSector.x,
                    y: gridSector.y,
                    w: this.containers[this.mouseData.containerKey].pos.w,
                    h: this.containers[this.mouseData.containerKey].pos.h,
                }

                let isCollision = this.areRectanglesCollidedWithRectangle(this.tmpContainerData.tmpContainerPos,currentContainerPos,[this.mouseData.containerKey])
                let placeholderId = this.makePlaceholderId([this.gridData.gridID]);
                let placeholder = document.getElementById(placeholderId);
                placeholder.style.display = "initial"; // TODO move display style to mouseDown, needs to be updated only once

                this.tmpContainerData.placeholderPos.x = gridSector.x; // move placeholder
                this.tmpContainerData.placeholderPos.y = gridSector.y;

                if(isCollision.isCollided){
                    placeholder.style.backgroundColor = "red";
                    this.mouseData.canBeDropped = false;
                }
                else{
                    placeholder.style.backgroundColor = 'green';
                    this.mouseData.canBeDropped = true;
                }
            }
            else if(this.mouseData.type == 'group'){  // if the user is dragging a group element,
                let hoveredOverElement = event.target;
                // console.log(hoveredOverElement)                                         // DONJI class name treba biti isti kao glavna klasa kontejnera
                let firstHoveredContainer = this.firstParentWithTargetClass(hoveredOverElement,'container',this.gridData.gridClass) // CLASS OF Container element
                if(firstHoveredContainer === null){
                    this.mouseData.prevHoveredOverGroupPlaceholderElement.style.display = 'none';
                    return;
                }
                let firstHoveredContainerKey = this.unwrapId(firstHoveredContainer.id)[0];
                let containerSize = firstHoveredContainer.getBoundingClientRect(); // to ccalculate relative mouse pos and sectors inside the container
                this.mouseData.prevHoveredOverContainerKey = firstHoveredContainerKey;

                // console.log(firstHoveredContainerKey) OK
                // mouse pos relative to inside the container
                let cntPosX = (event.clientX - containerSize.left);
                let cntPosY = (event.clientY - containerSize.top);

                let gridSector = { // smoothing to get better grid snapping while mouseOver, grid sector of cursor
                    // % of grid mouse is in          *          num of Rows/Cols       +1 bcz grid starts from 1
                    x: Math.floor((cntPosX/containerSize.width) * this.containers[firstHoveredContainerKey].innerGrid.cols) + 1,
                    y: Math.floor((cntPosY/containerSize.height) * this.containers[firstHoveredContainerKey].innerGrid.rows) + 1
                }

                // let isInsideInnerGrid =
                //     ( (gridSector.x) <= this.containers[firstHoveredContainerKey].innerGrid.rows) &&
                //     ( (gridSector.y) <= this.containers[firstHoveredContainerKey].innerGrid.cols);

                let currentContainerPos = { // w and h are the same but the x and y are mouse cursor gridSector values
                    x: gridSector.x,
                    y: gridSector.y,
                    w: this.containers[this.mouseData.containerKey].groupPos[this.mouseData.groupKey].w, //w and h of the dragged group eleemnt
                    h: this.containers[this.mouseData.containerKey].groupPos[this.mouseData.groupKey].h,
                }
                console.log(this.mouseData)
                let isCollision = this.areRectanglesCollidedWithRectangle(this.containers[firstHoveredContainerKey].groupPos,currentContainerPos,[this.mouseData.groupKey])

                let groupPlaceholderId = this.makePlaceholderId([firstHoveredContainerKey]);
                let groupPlaceholderElement = document.getElementById(groupPlaceholderId);
                if(this.mouseData.prevHoveredOverGroupPlaceholderElement != groupPlaceholderElement){
                    this.mouseData.prevHoveredOverGroupPlaceholderElement.style.display = 'none';
                    this.mouseData.prevHoveredOverGroupPlaceholderElement = groupPlaceholderElement;
                }

                // this.containers[firstHoveredContainerKey].groupPlaceholderPos.x = gridSector.x;
                // this.containers[firstHoveredContainerKey].groupPlaceholderPos.y = gridSector.y;

                this.$store.commit('setElementByKey',{
                    type:'container',
                    id:firstHoveredContainerKey,
                    val:{
                        x:gridSector.x,
                        y:gridSector.y,
                        w:Number(this.containers[firstHoveredContainerKey].groupPlaceholderPos.w),
                        h:Number(this.containers[firstHoveredContainerKey].groupPlaceholderPos.h),
                    },
                    key:'groupPlaceholderPos',
                })


                //  TODO ERROR
                let isCopyOfGroupAlreadyInContainer = this.containers[firstHoveredContainerKey].groupID.includes(this.mouseData.groupKey);
                let isCopyComingFromDifferentContainer = this.mouseData.containerKey != firstHoveredContainerKey;

                if(isCollision.isCollided || (isCopyOfGroupAlreadyInContainer && isCopyComingFromDifferentContainer)){
                    groupPlaceholderElement.style.backgroundColor = "red";
                    this.mouseData.canBeDropped = false;
                }
                else{
                    groupPlaceholderElement.style.backgroundColor = "green";
                    this.mouseData.canBeDropped = true;
                }
                groupPlaceholderElement.style.display = 'initial'; //FIXME

            }
        },

        onMouseReleaseDrag(){
            if(!this.mouseData.hasClicked) return;
            this.mouseData.hasClicked = false;

            if(this.mouseData.type == 'container'){
                if(this.mouseData.canBeDropped){
                    this.containers[this.mouseData.containerKey].pos.x = this.tmpContainerData.placeholderPos.x;
                    this.containers[this.mouseData.containerKey].pos.y = this.tmpContainerData.placeholderPos.y;
                    this.$store.dispatch('setElement',{
                        type: 'container',
                        id: this.mouseData.containerKey,
                        val: this.containers[this.mouseData.containerKey],
                    })

                }
                let placeholder = document.getElementById(this.makePlaceholderId([this.gridData.gridID]));
                placeholder.style.display = "none"; // TODO move display style to mouseDown
            }

            else if(this.mouseData.type == 'group' ){
                if(this.mouseData.canBeDropped){
                    const cntB = this.mouseData.prevHoveredOverContainerKey;

                    if(cntB == this.mouseData.containerKey){
                        this.moveGroupInsideSameContainer(
                            this.mouseData.groupKey,
                            this.containers[cntB].groupPlaceholderPos,
                            this.mouseData.containerKey,
                        );
                    }
                    else{
                        this.moveGroupFromACntToBCnt(
                            Number(this.mouseData.groupKey),
                            this.containers[cntB].groupPlaceholderPos,
                            this.mouseData.containerKey,
                            cntB
                        )
                    }
                }
                this.mouseData.prevHoveredOverGroupPlaceholderElement.style.display = 'none';
            }
            this.mouseData.mouseDownTarget.style.position = 'static';
            this.mouseData.canBeDropped = false;
        },

        // goes up the tree until it finds the first el with targetClass(returns that el) or failConditionClass(returns null)
        firstParentWithTargetClass(el,targetClass,failConditionClass){ // FIXME ponekad baci Uncaught TypeError: el.classList is undefined,,, neznam iznad cega je kada to baci
            if(el.classList.contains(targetClass)) return el; // tu ga baci TODO baci error kad je mis iznad elem kojeg vuce !!!!
            else if(el.classList.contains(failConditionClass)) return null;
            else return this.firstParentWithTargetClass(el.parentElement,targetClass,failConditionClass);
        },
        moveGroupInsideSameContainer(groupKey,groupPos,cntKey){
            this.containers[cntKey].groupPos[groupKey] = {... groupPos}; //FIXME delete the prev dict or just overwrite
        },
        moveGroupFromACntToBCnt(groupKey,groupPos,cntAKey,cntBKey){
            let cntAGrpID,cntBGrpID,cntAGrpPos,cntBGrpPos;

            cntAGrpID = Array.from(this.containers[cntAKey].groupID);
            cntBGrpID = Array.from(this.containers[cntBKey].groupID);

            cntAGrpPos = Object.assign({},this.containers[cntAKey].groupPos);
            cntBGrpPos = Object.assign({},this.containers[cntBKey].groupPos);

            cntAGrpID.splice(cntAGrpID.indexOf(groupKey),1);
            cntBGrpID.push(groupKey);

            delete cntAGrpPos[groupKey];
            cntBGrpPos[groupKey] = groupPos

            // console.log(cntAKey,cntBKey, groupKey)
            // console.log(cntAGrpID,cntBGrpID)
            // console.log(cntAGrpPos,cntBGrpPos)

            // this.containers[cntBKey].groupID.push(groupKey);
            // this.containers[cntBKey].groupPos[groupKey] = {... groupPos};
            // delete this.containers[cntAKey].groupPos[groupKey];
            // delete this.containers[cntAKey].groupID[this.containers[cntAKey].groupID.indexOf(groupKey)];

            this.$store.dispatch('setElementByKey',{
                type:'container',
                id:cntAKey,
                val:cntAGrpID,
                key:'groupID',
            })

            this.$store.dispatch('setElementByKey',{
                type:'container',
                id:cntBKey,
                val:cntBGrpID,
                key:'groupID',
            })

            this.$store.dispatch('setElementByKey',{
                type:'container',
                id:cntAKey,
                val:cntAGrpPos,
                key:'groupPos',
            })

            this.$store.dispatch('setElementByKey',{
                type:'container',
                id:cntBKey,
                val:cntBGrpPos,
                key:'groupPos',
            })

            // console.log(this.containers[cntAKey],this.containers[cntBKey])
        },
        /////////////////////////////////////////////////////////////////////////////////////////////////
        getGroups(container) { // join all the groups of a container in an array
            let groupList = container.groupID;
            let res = {}, key;
            for( key in groupList) if(this.groups[key]) res[key] = this.groups[key];
            return res;
        },

        createGridArea(groupPos){
            // console.log(groupPos)
            // console.log(this.getGroups(groupPos.container))
            groupPos = groupPos.container.groupPos[groupPos.container.groupID[groupPos.keyGroup]];
            // console.log(groupPos)

            let gridColumnStart= groupPos.x ;
            let gridColumnEnd= groupPos.x + groupPos.w ;
            let gridRowStart= groupPos.y  ;
            let gridRowEnd= groupPos.y + groupPos.h ;

            let grdAr = `${gridRowStart} / ${gridColumnStart} / ${gridRowEnd} / ${gridColumnEnd}`

            return {
                gridArea:grdAr
            }
        },

        async addGrid(){
            let newId = await this.CreateNewContainer(this.ID) ;
            await this.loadData()

            // moram pricekati da vue ucita promijene
            await new Promise((resolve, reject) => { setTimeout(()=>{resolve(1)},10);  })

            this.mouseData.hasClicked = true; // "unlocks" the mouseMove function
            this.mouseData.dragId = this.makeDragId([newId]); // save id of clicked drag element so we can get the id of the container
            this.mouseData.type = 'container'; // used in mouseMove to know the type
            this.mouseData.containerId = this.mouseData.dragId.substring(5,this.mouseData.dragId.length); // drag elements id : drag+
            this.mouseData.mouseDownTarget = document.getElementById(this.mouseData.containerId);
            this.mouseData.mouseDownTarget.style.position = 'absolute'; // 'unlock' the container so it can be moved
            this.mouseData.containerKey = this.unwrapId(this.mouseData.containerId)[0];
            this.refreshTmpContainerPosDic(); // used for collision detection
            this.tmpContainerData.placeholderPos.w = this.containers[this.mouseData.containerKey].pos.w; // set placeholder w and h to be the same as current dragged elem.
            this.tmpContainerData.placeholderPos.h = this.containers[this.mouseData.containerKey].pos.h;
        },

        loadData(){
            this.$store.dispatch('getElement',{
                type:'dashboard',
                id:this.ID
            }).then(dash=> {
                //grid setup
                this.gridData = dash.gridData
                this.gridData.dashboardTarget = document.getElementById(this.ID);
                this.gridData.grid = this.gridData.dashboardTarget.getBoundingClientRect();
                // get containers
                this.$store.dispatch('getElements',{
                    type:'container',
                    id:dash.containerID
                }).then(cnt=> {

                    for(let key in cnt){
                        if(cnt[key] !== null){
                            if( cnt[key].groupID == undefined){
                                // console.log(key)
                                this.$store.dispatch('setElementByKey',{
                                    type:'container',
                                    id:key,
                                    val:[],
                                    key:'groupID'
                                })
                                this.$store.dispatch('setElementByKey',{
                                    type:'container',
                                    id:key,
                                    val:{},
                                    key:'groupPos'
                                })
                                // cnt[key].groupID = [];
                                // cnt[key].groupPos = {};
                            }
                            else{
                                this.$store.dispatch('setElementByKey',{
                                    type:'container',
                                    id:key,
                                    val:Object.assign({},cnt[key].groupPos),
                                    key:'groupPos'
                                })
                            }
                        }
                    }

                    this.containers = cnt;
                    let groupIDs = Object.values(cnt).map(a=>a.groupID);
                    groupIDs = groupIDs.flat();
                    groupIDs = new Set(groupIDs);
                    groupIDs = {...Array.from(groupIDs)};
                    this.$store.dispatch('getElements',{
                        type:'group',
                        id:groupIDs
                    }).then(grp=> {
                        // console.log(grp)
                            this.groups = grp;
                        }
                    )
                })
            })
        },

        ...mapActions([
            'setElement'
        ])
    },
    computed:{

        ...mapGetters([
            'isDbReady',
            'getDash',
            'getCnt',
            'getGroup',
            'getSec',
            'getItem',

        ])
    },
    watch:{
        // ako korisnik refresha stranicu mora se svaki put provjeriti dali je jos uvijek baza spremna te se tek onda grid popunjava s podacima
        isDbReady(newState,oldState) { // TODO ELSE loading
            if(newState){
                this.loadData();
            }
        },
    },
    beforeMount() {
        this.ID=this.$route.query.id;
        if(this.isDbReady) this.loadData(); //ako je vec baza spremna ucitaj podatke
    },
}