Vue.component('card', {
    props: {
        card: {
            type: Object,
            required: true
        },
        cardIndex: {
            type: Number,
            required: true,
        }
    },
    template: `
        <div class="card">
            <h3>{{card.name}}</h3>
            <ul>
                <li v-for="task in card.tasks">
                <label>{{task.name}}
                    <input type="checkbox" v-model="task.ready" @change="taskCompletionUpdate(cardIndex, task)">
                </label>
                </li>
            </ul>
            <h3 class="card-date-ready" v-show="card.dateToReady" >{{card.dateToReady}}</h3>
        </div>
    `,
    methods: {
        taskCompletionUpdate(cardIndex, task){
            let indexes = {
                cardIndex: cardIndex,
                taskIndex: this.card.tasks.indexOf(task)
            }
            this.$emit('task-updated', indexes);
        }
    }

})

Vue.component('modal', {
    props: {
        isVisible: {
            type: Boolean,
            required: true
        },
        modalTitle: {
            type: String,
            required: true,
        }
    },
    template: `
        <div class="modal" v-if="isVisible">
            <div class="modal-content">
                <h3>Добавить карточку в столбец "{{modalTitle}}"</h3>
                <div class="errors" v-if="errors.length > 0">
                    <ul>
                        <li v-for="error in errors">{{error}}</li>
                    </ul>
                </div>
                <form @submit.prevent="addCard">
                <label>Название карточки
                <input type="text" v-model="nameCard">
                </label>
                <div class="add-task">
                    <label>
                        Задача: <input type="text" v-model="task">
                    </label>
                    <button type="button" @click="addTask">Добавить задачу</button>
                </div>
                <div class="modal-tasks" v-if="card.tasks.length > 0">
                    <ul>
                        <li v-for="task in card.tasks">{{task.name}}</li>
                    </ul>
                </div>
                <div class="buttons">
                    <button type="button" @click="closeModal">Закрыть</button>
                    <button type="submit">Добавить карточку</button>
                </div>
                </form>
            </div>
        </div>
    `,
    data(){
        return {
            nameCard: '',
            errors: [],
            card: {
                name: '',
                tasks: [],
            },
            task: '',
        }
    },
    methods: {
        addCard(){
            this.errors = [];
            if(this.nameCard === ''){
                this.errors.push('Пожалуйста, введите название карточки');
                if(this.card.tasks.length === 0){
                    this.errors.push('Пожалуйста, добавьте хотя бы одну задачу');
                    return;
                }
                return;
            }
            if(this.card.tasks.length === 0){
                this.errors.push('Пожалуйста, добавьте хотя бы одну задачу');
                return;
            }
            this.card.name = this.nameCard;
            this.$emit('add-card', this.card);
            this.nameCard = '';
            this.task = '';
            this.card = {
                name: '',
                tasks: [],
                dateToReady: null,
            }
            this.$emit('save-data');
        },
        addTask(){
            this.errors = [];
            if(this.task === ''){
                this.errors.push('Пожалуйста, введите задачу');
                return;
            }
            this.card.tasks.push({name: this.task, ready: false})
        },
        closeModal(){
            this.$emit('close-modal');
            this.errors = [];
        },


    }
});

Vue.component('column', {
    props: {
        column: {
            type: Object,
            required: true,
        },
        columnIndex: {
            type: Number,
            required: true,
        }
    }, 
    template: `
        <div class="column">
            <div class="errors" v-show="errors.length > 0">
                <ul>
                    <li v-for="error in errors">{{error}}</li>
                </ul>
            </div>
            <modal 
                :isVisible="modalVisibilty"
                :modalTitle="column.title" 
                @close-modal="closeModal" 
                @add-card="addCard"
                @save-data="$emit('save-data')"
            ></modal>
            <h2>{{column.title}}</h2>
            <button v-show="columnIndex === 0" type="button" @click="openModal">Добавить карточку</button>
            <card
                v-for="(card, index) in column.cards"
                :card="card"
                :cardIndex="index"
                @task-updated="cardUpdate"
            ></card>
        </div>
    `,
    data(){
        return {
            modalVisibilty: false,
            errors: [],
        }
    },
    methods: {
        openModal(){
            this.errors = [];
            if(this.columnIndex === 0 && this.column.cards.length === 3){
                this.errors.push("Вы не можете добавить в этот столбец более 3-ёх карточек");
                return;
            }
            this.modalVisibilty = true;
        },
        closeModal(){
            this.modalVisibilty = false;
        },
        addCard(card){
            this.column.cards.push(card);
            this.closeModal();
        },
        cardUpdate(indexes){
            indexes.columnIndex = this.columnIndex;
            this.$emit('card-update', indexes)
        }
    }
})

let app = new Vue({
    el: '#app',
    data(){
        return {
            columns: JSON.parse(localStorage.getItem('columns')) || [
                {title: 'Начато', cards: []},
                {title: 'В процессе', cards: []},
                {title: 'Завершенные', cards: []}
            ],
            isVisible: false,
        }
    },
    methods: {
        moveCard(columnIndex, cardIndex, moveToIndex){
            const card = this.columns[columnIndex].cards[cardIndex];
            this.columns[columnIndex].cards.splice(cardIndex, 1);
            if(moveToIndex === 2){
                card.dateToReady = new Date(Date.now()).toString();
            }
            this.columns[moveToIndex].cards.push(card);
        },
        updateColumn(indexes){

            let columnIndex = indexes.columnIndex;
            let cardIndex = indexes.cardIndex;
            let taskIndex = indexes.taskIndex;

            const tasks = this.columns[columnIndex].cards[cardIndex].tasks;
            const completedTasks = tasks.filter(task => task.ready);
            const progress = completedTasks.length / tasks.length;
            

            if(columnIndex === 0 && progress > 0.5 && progress < 1 && this.columns[1].cards.length < 5){
                this.moveCard(columnIndex, cardIndex, 1)
            }else if(progress === 1){
                this.moveCard(columnIndex, cardIndex, 2)
            }else if(columnIndex === 2 && progress < 1 && progress > 0.5){
                this.moveCard(columnIndex, cardIndex, 1)
            }else{
                this.moveCard(columnIndex, cardIndex, 0)
            }
            this.saveData();
        },
        saveData(){
            localStorage.setItem("columns", JSON.stringify(this.columns));
        }
    }
});