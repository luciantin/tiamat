<template>
  <div class="container"  @mouseleave="onMouseLeaveContainer">

    <div class="containerHeader" v-if="showHeader">
      <div class="Left">
        <slot name="ContainerDrag"></slot>
      </div>
      <div class="Mid" v-if="showTitle">
        <h4 @click="onTitleClick" v-if="!showTitleInput">{{localMeta.title}}</h4>
        <input class="titleInput"  ref="input"  :value="localMeta.title" v-else @focusout="onFocusOutOfTitleInput">
<!--        <div class="ShowTitle">-->
<!--          <img src="@/assets/img/GridMenu/Show.svg"  @click="onHideTitleClick" />-->
<!--        </div>-->
      </div>
      <div class="Right">
        <div class="ContainerMenuButton" v-if="showMenu">
          <img src="@/assets/img/GridMenu/MenuElem.svg"  @click="onContainerMenuClick" />
        </div>
      </div>
    </div>

    <div
        v-if="!showSettings"
        class="containerGroups"
        :style="{
          gridTemplateRows: makeGridByRepeat(this.groupGridRowCount),
          gridTemplateColumns: makeGridByRepeat(this.groupGridColCount),
        }"
    >
      <slot name="ContainerGroups"></slot>
    </div>

    <CommonElementMenu
        v-else
        class="CommonElementMenu"
       :elementType="'container'"
       :elementID="containerID"
       :gridType="GridType"
        @MenuItemClick="onMenuItemClick"
    />

    <div class="ContainerFooter">
      <slot name="ContainerFooter" />
    </div>

  </div>
</template>

<script>


import CommonElementMenu from "@/components/grid/GridBaseElements/Common/ElementMenu/CommonElementMenu";
import {CreateNewGroup} from "@/components/grid/ElementHelpers/elementCreate";
import {DeleteContainer, DeleteGroupFromContainer} from "@/components/grid/ElementHelpers/elementDelete";

export default {
  name: "Container",
  components: {CommonElementMenu},
  props:{
    groupGridColCount: Number,
    groupGridRowCount: Number,
    meta:Object,
    containerID:Number,
    GridType:String,
    gridID:String,
    modalID:String,
    styleData:Object,
  },
  emits:['loadData','showModal'],
  data(){
    return{
      showSettings:false,
      showTitleInput:false,
      // showTitle:true,
      localMeta:{},
    }
  },
  methods:{
    onContainerMenuClick(){
      this.showSettings = true;
    },
    // onHideTitleClick(){
    //   this.showTitle = false;
    // },
    // onContainerHeaderClick(){
    //   this.showTitle = true;
    // },
    onMouseLeaveContainer(){
      this.showSettings = false;
    },
    makeGridByRepeat(num){
      let str = '';
      for(let i = 0; i< num; i++) str += '1fr ';
      return str;
    },
    onTitleClick(){
      this.showTitleInput = true;
    },
    onFocusOutOfTitleInput(e){
      this.localMeta.title = e.srcElement.value;
      this.$store.dispatch('setElementByKey',{
        type:'container',
        id:this.containerID,
        key:'meta',
        val:this.localMeta
      })
      this.showTitleInput = false;
    },
    createLocalMeta(){
      let tmp = Object.assign({},this.meta);
      delete tmp.tags;
      this.localMeta = {
        tags:Array.from(this.meta.tags),
        ...tmp
      }
    },
    onMenuItemClick(item) {
      let res = null;
      if(item.id === 'Add'){
        res = CreateNewGroup(this.containerID);
      }
      if(item.id === 'Delete'){
        console.log('Delete')
        res = DeleteContainer(this.gridID,this.containerID,this.GridType);
      }
      this.$emit('loadData',res)
      this.showSettings = false;
    }
  },
  computed:{
    showHeader(){
      return this.styleData.container.header
    },
    showTitle(){
      return this.styleData.container.title;
    },
    showMenu(){
      return this.styleData.container.menu
    }
  },
  mounted() {
    this.createLocalMeta();
  },
  updated() {
    if(this.showTitleInput) this.$refs.input.focus()
  }
}
</script>

<style lang="scss" scoped>

.container {
  //padding: 10px;
  display: flex;
  flex-direction: column;
  background-color: #FFF2F2;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.25);
  border-radius: 10px;


  overflow: hidden;
  &:hover{
    //overflow-y: scroll;
  }

  .containerGroups{
    display: grid;
    min-height: 40px;
    min-width: 40px;
    width: 100%;
    height: 100%;
    grid-gap: 10px;
    padding: 5px 5px 10px 5px;
    overflow: hidden;
    flex-grow: 1;
    &:hover{
      overflow-y: auto;

    }
  }

  .CommonElementMenu{
    flex-grow: 1;
  }

  .ContainerMenuButton{
    width: 1.1em;
    height: 1.1em;
    align-items: center;
    align-content: center;
    justify-content: center;
    justify-items: center;
  }

  .containerHeader{
    background-color: #3CA9C1;
    min-height: 2em;
    align-items: center;
    padding: 0px 8px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 1fr;
    grid-column-gap: 0px;
    grid-row-gap: 0px;

    &:hover{
      .Left{
        visibility: visible;
      }
      .Right{
        visibility: visible;
      }
    }

    .Left{
      visibility: hidden;
      justify-self: left;
      grid-area: 1 / 1 / 2 / 2;
    }
    .Mid{
      display: flex;
      flex-direction: row;
      justify-self: center;
      grid-area: 1 / 2 / 2 / 3;
    }
    .Right{
      visibility: hidden;
      justify-self: right;
      grid-area: 1 / 3 / 2 / 4;
    }
  }

  .ContainerFooter{
    position: relative;
    bottom: 0;
    display: flex;
    flex-direction: row;
    justify-content: right;
  }

  .titleInput{
    font-family: Arial, sans-serif;
    font-size: 100%;
    width: 95%;
    pointer-events: all;
    border: none;
    user-select: initial;
    text-align: center;
    background-color: rgba(0,0,0,0);
    font-weight: bold;
    &:focus{
      outline: none;
    }
  }


}

</style>