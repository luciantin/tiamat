<template>

<!--  <div v-if="itemData !== null">-->
<!--    {{itemData.type}} {{itemData.content}}-->
<!--  </div>-->

  <div v-if="itemData !== null" class="itemContainer">
    <GridItemText  class="item" v-if="itemData.type === 'text'" :content="itemData.content" :ID="{itemID,sectionID}" @onItemDelete="onItemDelete" />
    <GridItemCheckbox  class="item"  v-if="itemData.type === 'checkbox'" :content="itemData.content" :ID="{itemID,sectionID}" @onItemDelete="onItemDelete" />
    <GridItemFile  class="item"  v-if="itemData.type === 'file'" :content="itemData.content" :ID="{itemID,sectionID}" @onItemDelete="onItemDelete" />
    <GridItemImage  class="item"  v-if="itemData.type === 'image'" :content="itemData.content" :ID="{itemID,sectionID}" @onItemDelete="onItemDelete" />
    <GridItemLink  class="item"  v-if="itemData.type === 'link'" :content="itemData.content" :ID="{itemID,sectionID}" @onItemDelete="onItemDelete" />
    <GridItemList  class="item"  v-if="itemData.type === 'list'" :content="itemData.content" :ID="{itemID,sectionID}" @onItemDelete="onItemDelete" />
    <GridItemStuffspace   v-if="itemData.type === 'stuffspace'" :content="itemData.content" :ID="{itemID,sectionID}" @onItemDelete="onItemDelete" />
    <GridItemTable  class="item"  v-if="itemData.type === 'table'" :content="itemData.content" :ID="{itemID,sectionID}" @onItemDelete="onItemDelete" />
  </div>


</template>

<script>
import GridItemText from "@/components/grid/Factory/Items/GridItemText";
import GridItemCheckbox from "@/components/grid/Factory/Items/GridItemCheckbox";
import GridItemFile from "@/components/grid/Factory/Items/GridItemFile";
import GridItemImage from "@/components/grid/Factory/Items/GridItemImage";
import GridItemLink from "@/components/grid/Factory/Items/GridItemLink";
import GridItemList from "@/components/grid/Factory/Items/GridItemList";
import GridItemStuffspace from "@/components/grid/Factory/Items/GridItemStuffspace";
import GridItemTable from "@/components/grid/Factory/Items/GridItemTable";
export default {
  name: "ItemFactory",
  components: {
    GridItemTable,
    GridItemStuffspace,
    GridItemList, GridItemLink, GridItemImage, GridItemFile, GridItemCheckbox, GridItemText},
  props: {
    itemID:Array,
    sectionID:String,
    groupID:String,
    containerID:String,
    gridType:String,
  },
  emits:['onItemDelete'],
  data(){
    return{
      itemData:null,
    }
  },
  methods:{
    onItemDelete(e){
      // console.log(e)
      this.$emit('onItemDelete',e)
    }
  },
  beforeCreate() {
    if (this.itemID >= 0 && this.itemID !== null) {
      this.$store.dispatch('getElement', {
        type: 'item',
        id: this.itemID,
      }).then(item => {
        this.itemData = item
      })
    }
  }
}
</script>

<style scoped lang="scss">

.itemContainer{
  width: 98%;


  .item{
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25);
    border-radius: 5px;
    width: 100%;
  }
}

</style>