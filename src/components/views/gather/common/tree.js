//方法1
//按elemenui tree的数据结构去构造数据
export function getListData(objects) {
  var dataArray = [];
  for (var i = 0; i < objects.length; i++) {
    let parentId = objects[i].PID;
    if (parentId === null) {
      let objTemp = {
        id: objects[i].ID,
        label: objects[i].NAME,
        description: objects[i].DESCRIPTION,
        tablename: objects[i].TABLE_NAME,
        pid: objects[i].PID,
        taskid: objects[i].TASKID,
        layerimg: objects[i].LAYERIMG,
        color: objects[i].COLOR,
        colorStyle:'color:'+ objects[i].COLOR,
        type: objects[i].TYPE,
      };
      dataArray.push(objTemp);
    }
  }
  return data2treeDG(objects, dataArray);
}
//递归children
export function data2treeDG(datas, dataArray) {
  for (let j = 0; j < dataArray.length; j++) {
    let dataArrayIndex = dataArray[j];
    let childrenArray = [];
    let Id = dataArrayIndex.id;
    for (let i = 0; i < datas.length; i++) {
      let data = datas[i];
      let parentId = data.PID;
      if (parentId == Id) {
        //判断是否为儿子节点
        let objTemp = {
          id: data.ID,
          label: data.NAME,
          description: data.DESCRIPTION,
          tablename: data.TABLE_NAME,
          pid: parentId,
          taskid: data.TASKID,
          layerimg: data.LAYERIMG,
          color: data.COLOR,
          colorStyle:'color:'+ data.COLOR,
          type: data.TYPE,
        };
        childrenArray.push(objTemp);
      }
    }
    dataArrayIndex.children = childrenArray;
    if (childrenArray.length > 0) {
      data2treeDG(datas, childrenArray);
    }
  }
  return dataArray;
}
//方法2
//数组和树结构数据相互转换
export function translateDataToTree(datas) {
  //没有父节点的数据
  let parents = datas.filter(value => value.pid == 'undefined' || value.pid == null)
  //有父节点的数据
  let childrens = datas.filter(value => value.pid !== 'undefined' && value.pid != null)
  //定义转换方法的具体实现
  let translator = (parents, childrens) => {
    //遍历父节点数据
    parents.forEach((parent) => {
        //遍历子节点数据
        childrens.forEach((current, index) => {
            //此时找到父节点对应的一个子节点
            if (current.pid === parent.id) {
              //对子节点数据进行深复制，这里只支持部分类型的数据深复制，对深复制不了解的童靴可以先去了解下深复制
              let temp = JSON.parse(JSON.stringify(childrens))
              //让当前子节点从temp中移除，temp作为新的子节点数据，这里是为了让递归时，子节点的遍历次数更少，如果父子关系的层级越多，越有利
              temp.splice(index, 1)
              //让当前子节点作为唯一的父节点，去递归查找其对应的子节点
              translator([current], temp)
              //把找到子节点放入父节点的childrens属性中
              typeof parent.children !== 'undefined' ? parent.children.push(current) : parent.children = [current]
            }
          }
        )
      }
    )
  }
  //调用转换方法
  translator(parents, childrens)
  //返回最终的结果
  return parents
}
