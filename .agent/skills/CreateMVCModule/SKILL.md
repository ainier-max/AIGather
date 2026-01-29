---
name: CreateMVCModule
description: Create a new Vue 3 + Pinia module following the MVC pattern (Controller/Model/View) as seen in `src/components/AIDevModel`.
---

# CreateMVCModule

This skill creates a new module structured according to the `AIDevModel` specification found in `src/components/AIDevModel`.

## Usage

When the user asks to create a new module, component, or feature, use this skill to ensure consistency with the project's MVC architecture.

## Steps

1.  **Determine Module Name**: Identify the name of the new module (e.g., `StartPage`, `UserLogin`, etc.). Let's refer to it as `ModuleName`.
2.  **Create Directory Structure**:
    -   `src/components/${ModuleName}/Controller/`
    -   `src/components/${ModuleName}/Model/`
    -   `src/components/${ModuleName}/View/`
    -   `src/components/${ModuleName}/View/style/`
    -   `src/components/${ModuleName}/View/assets/`

3.  **Generate Files**: Use the `write_to_file` tool to create the following files with the specified content. Replace `${ModuleName}` with the actual module name.

    ### 1. `src/components/${ModuleName}/Model/ModelClass.js`
    
    ```javascript
    /**
     * MVC中的Model层,主要用来处理逻辑，Model会有多个业务逻辑类
     */
    class ModelClass {
        //参数可提取到这里
        name = "${ModuleName}";
        
        constructor() {
        }
        
        // Example method
        action() {
            console.log("Action executed in ${ModuleName}");
        }
    }
    export default ModelClass
    ```

    ### 2. `src/components/${ModuleName}/Controller/controllerStore.ts`
    
    ```typescript
    /**
     * MVC中的Controller层,主要用来处理中间跳转
     */
    import { defineStore, storeToRefs } from 'pinia'
    //根据实际需要更改controllerStore与controllerStoreID值
    import ModelClass from "@/components/${ModuleName}/Model/ModelClass.js"

    export const controllerStore = defineStore('${ModuleName}ControllerID', {
      state: () => ({
        modelClass: null
      }),
      getters: {},
      actions: {
        initClass() {
          this.modelClass = new ModelClass
        }
      }
    })

    const storeInstance = controllerStore()
    storeInstance.initClass()
    ```

    ### 3. `src/components/${ModuleName}/View/style/index.css`
    
    ```css
    .mainClass {
        position: relative;
        /* Add your styles here */
    }
    ```

    ### 4. `src/components/${ModuleName}/View/index.vue`
    
    ```vue
    <!--MVC中的View层,主要用来显示界面信息-->
    <template>
        <div class="mainClass">
            <div>
                {{ modelClass?.name }}
            </div>
            <!-- Example interaction -->
            <!-- <el-button @click="handleClick">Action</el-button> -->
        </div>
    </template>
    <script setup>
    import { storeToRefs } from "pinia";
    import { controllerStore } from "@/components/${ModuleName}/Controller/controllerStore.ts";
    const controllerStoreObj = controllerStore();
    const { modelClass } = storeToRefs(controllerStoreObj);

    //该区域尽量不写逻辑代码
    const handleClick = () => {
        // modelClass.value.action();
    }

    </script>
    <style scoped>
    @import "./style/index.css";
    </style>
    ```

4.  **Completion**: Inform the user that the module `${ModuleName}` has been created and is ready for implementation.
