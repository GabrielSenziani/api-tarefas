const fs = require('fs')

const express = require('express');
const app = express();  

app.use(express.json()); //permite receber o JSON

app.listen(3001, () => {
    console.log('Servidor atualizado e rodando na porta 3001')
});

let tarefas = JSON.parse(fs.readFileSync('tarefas.json'));

app.post('/tarefas', (req, res) => { //criando rota de adicionar tarefa
    const { nome } = req.body;

    const novaTarefa = {
        id: Date.now(),
        nome: nome,
        concluida: false
    };

    tarefas.push(novaTarefa);

    fs.writeFileSync('tarefas.json', JSON.stringify(tarefas, null, 2));

    res.status(201).json(novaTarefa);
})

app.get('/tarefas/', (req, res) => { //listar tarefas
    res.json(tarefas);
});

app.get('/tarefas/concluidas', (req, res) => {
    const tarefasConcluidas = tarefas.filter(tarefa => tarefa.concluida === true);
    
    res.json(tarefasConcluidas);
})

app.delete('/tarefas/:id', (req, res) => { //deletando tarefa
    const id = Number(req.params.id);

    tarefas = tarefas.filter(tarefa => tarefa.id !== id);

    fs.writeFileSync('tarefas.json', JSON.stringify(tarefas, null, 2));

    res.json({ mensagem: 'Tarefa removida.' });
});

app.put('/tarefas/:id', (req, res) => {
    const id = Number(req.params.id);

    const tarefa = tarefas.find(t => t.id === id);

    if(!tarefa) {
        return res.status(404).json({ erro: 'Tarefa não encontrada.' })
    }

    tarefa.concluida = true;

    fs.writeFileSync('tarefas.json', JSON.stringify(tarefas, null, 2));

    res.json(tarefa);
});

