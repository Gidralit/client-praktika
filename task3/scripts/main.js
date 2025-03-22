Vue.component('column', {
    props: ['column', 'column-index'],
    template: `
        <div class="column" @dragover.prevent @dragenter.prevent @drop="onDrop">
            <h2> {{column.title}} </h2>
        </div>
    `,
    methods: {
        updateCard(card) {
            this.$emit('update-card', card);
        },
        
        onDrop(event) {
            let cardId = event.dataTransfer.getData('cardId');
            let fromColumnIndex = event.dataTransfer.getData('fromColumnIndex');
            let toColumnIndex = this.columnIndex;

            if(fromColumnIndex == 3){
                alert("Перемещение из столбца 'Выполненные задачи' запрещено");
                return;
            }

            if (fromColumnIndex == 2 && toColumnIndex == 1) {
                alert("Перемещение из столбца 'Тестирование' в столбец 'В работе' запрещено.");
                return;
            }

            if (fromColumnIndex !== toColumnIndex) {
                this.$emit('move-card', { cardId, fromColumnIndex, toColumnIndex });
            }
        }
    }
});

const app = new Vue({
    el: '#app',
    data(){
        return {
            columns: JSON.parse(localStorage.getItem("columns")) || [
                {title: "Запланированные задачи", cards: []},
                {title: "Задачи в работе", cards: []},
                {title: "Тестирование", cards: []},
                {title: "Выполненные задачи", cards: []},
            ]
        }
    },
    methods: {
        addCard(){

        },
        moveCard(){
            
        },
        deleteCard(){

        },
    }
});