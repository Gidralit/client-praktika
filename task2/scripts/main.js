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
            <div 
            v-for="(task, index) in card.tasks"
            :key = "index + task.name">
                <label>{{task.name}}
                    <input 
                    type="checkbox" 
                    v-model="task.ready" 
                    @change="taskCompletionUpdate">
                </label>
            </div>
            <h3 class="card-date-ready" v-show="card.dateToReady" >{{card.dateToReady}}</h3>
        </div>
    `,
    methods: {
        taskCompletionUpdate(){
            this.$emit('update-card', this.cardIndex)
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
                id: 0,
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
            if(this.card.tasks.length < 3){
                this.errors.push('Вы не можете создать карточку, у которой менее 3-ех задач');
                return;
            }
            this.card.name = this.nameCard;
            this.card.id = Math.floor(Math.random() * 100);
            this.$emit('add-card', this.card);
            this.nameCard = '';
            this.task = '';
            this.card = {
                id: 0,
                name: '',
                tasks: [],
            };
            this.$emit('save-data');
        },
        addTask(){
            this.errors = [];
            if(this.task === ''){
                this.errors.push('Пожалуйста, введите задачу');
                return;
            }
            if(this.card.tasks.length === 5){
                this.errors.push('Вы не можете добавить в карточку более 3-ех задач');
                return;
            }
            let newTask = {name: this.task, ready: false};

            this.card.tasks.push(newTask);
            newTask = {};
            this.task = '';
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
        },
        firstColumnBlocked: {
            type: Boolean,
            default: false,
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
            <button v-show="columnIndex === 0" type="button" @click="openModal" v-show="canAddCard">Добавить карточку</button>
            <div class="cards">
                <card
                    v-for="(card, index) in column.cards"
                    :key="card.name + index + card.id"
                    :card="card"
                    :cardIndex="index"
                    @update-card="cardUpdate"
                ></card>
            </div>
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
        cardUpdate(cardIndex){
            this.$emit('card-update', cardIndex, this.columnIndex);
        }
    },
    computed: {
        canAddCard(){
            return this.columnIndex === 0 && this.column.cards.length < 3 && !this.firstColumnBlocked;
        }
    }
})

    let app = new Vue({
        el: '#app',
        data(){
            return {
                columns: JSON.parse(localStorage.getItem('columns')) || [
                    {title: 'Начато', cards: [], canEdit: true},
                    {title: 'В процессе', cards: []},
                    {title: 'Завершенные', cards: []}
                ],
            }
        },
        methods: {
            updateColumn(cardIndex, columnIndex){
                let completedTasks = this.columns[columnIndex].cards[cardIndex].tasks.filter(item => item.ready)
                let progress = completedTasks.length / this.columns[columnIndex].cards[cardIndex].tasks.length;

                if(progress >= 0.5 && columnIndex === 0){
                    this.columns[1].cards.push(this.columns[columnIndex].cards.splice(cardIndex, 1)[0]);
                }
                if(progress === 1 && columnIndex === 1){
                    let card = this.columns[columnIndex].cards[cardIndex];
                    card.dateToReady = new Date();
                    this.columns[columnIndex].cards.splice(cardIndex, 1);
                    this.columns[2].cards.push(card);
                }
                this.saveData();
            },
            saveData(){
                localStorage.setItem("columns", JSON.stringify(this.columns));
            }
        },
        computed: {
            firstColumnBlocked() {
                return this.columns[1].cards.length >= 5;
            }
        }
    });