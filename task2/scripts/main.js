Vue.component('card', {
    template: `
    <div class="card">
        
    </div>`,
})

Vue.component('modalScreen', {
    template: `
    <div class="modal-mask">
        <div class="modal-wrapper">
            <div class="modal-container">
                <form @submit.prevent="onSubmit">
                    <div class="modal-header">
                        <h2>Задача</h2>
                    </div>
                    <div class="modal-body">
                        <label for="name">Название карточки</label>
                        <input id="name" type="text">
                        <p>Список задач:</p>
                            <form @submit.prevent="addTaskSubmit">
                                <input type="text" v-model="taskName">
                                <button @click="addTask">Добавить задачу</button
                            </form>>
                    </div>
                    <div class="modal-footer">
                        <button @click="$emit('close')">Отмена</button>
                        <button type="submit" @click="$emit('addCard', )">Добавить карточку</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `,
    data(){
        return {
            name: null,
            tasks: [
                {
                    name: null,
                    ready: false,
                }
            ],
            taskName: null,
        }
    },
    methods:{
        addTask(){
            this.taskName =
        }
    }

})
Vue.component('task-column', {
    props: {
      taskbar: {
          type: String,
          required: true
      },
      taskbars: {
          type: Array,
          required: true
      }
    },
    template: `
    <div :class="taskbar.class">
        <modalScreen v-show="showModal" @close="showModal = false"></modalScreen>
        <div class="plus" @click="showModal = true">+</div>
    </div>
    `,
    data(){
        return {
            showModal: false,
        }
    },
    methods:{
        addCard(){

        },
    }
})
Vue.component('to-do-list', {
    template: `
    <div class="container">
        <task-column v-for="(taskbar, index) in taskbars" :taskbar="taskbars[index]" :taskbars="taskbars">{{taskbar}}</task-column>
    </div>
    `,
    data(){
        return {
            taskbars: [
                {
                    class: 'taskbar taskbar-1',
                    cards: []
                },
                {
                    class: 'taskbar taskbar-2',
                    cards: []
                },
                {
                    class: 'taskbar taskbar-3',
                    cards: []
                }
            ],
        }
    },
})

let app = new Vue({
    el: '#app',

});