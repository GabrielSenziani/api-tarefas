const fs = require('fs')

const express = require('express');
const app = express();  

app.use(express.json()); //permite receber o JSON

app.listen(3001, () => {
    console.log('Servidor atualizado e rodando na porta 3001')
});

let tarefas = JSON.parse(fs.readFileSync('tarefas.json'));

function gerarDataAleatoria(d1, d2) {
    const inicio = d1.getTime();
    const fim = d2.getTime();

    const dataAleatoria = new Date(inicio + Math.random() * (fim - inicio));
    const ano = dataAleatoria.getFullYear();
    const mes = String(dataAleatoria.getMonth() + 1).padStart(2, '0');
    const dia = String(dataAleatoria.getDate()).padStart(2,'0');

    return `${ano}-${mes}-${dia}`;
}

function gerarTempoEstimado(min, max) {
    const tempoAleatorio = Math.floor(Math.random() * (max - min) + min);
    return tempoAleatorio
}



app.post('/tarefas', (req, res) => { //criando rota de adicionar tarefa
    const { nome } = req.body;
    
    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
    return res.status(400).json({ erro: 'Nome inválido' });
}

    const hoje = new Date();
    
    const dataFim = new Date();
    dataFim.setDate(hoje.getDate() + 30)

    const min = 30
    const max = 180

    const novaTarefa = {
        id: Date.now(),
        nome: nome,
        concluida: false,
        tempoEstimado: gerarTempoEstimado(min, max),
        dataConclusao: gerarDataAleatoria(hoje, dataFim)
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

app.get('/tarefas/atrasadas', (req, res) => {
    const hoje = new Date();
    const tarefasAtrasadas = tarefas.filter(tarefa => {
       const data = new Date(tarefa.dataConclusao);
       return data < hoje
    })
    
    res.json(tarefasAtrasadas);
})

app.get('/tarefas/tempo-total', (req, res) => {
    const tarefasPendentes = tarefas.filter(tarefa => tarefa.concluida === false);

    const tempoTotal = tarefasPendentes.reduce((soma, tarefa) => {
        return soma + tarefa.tempoEstimado;
    }, 0);

    const quantidade = tarefasPendentes.length;

    res.json({ tempoTotal, quantidade});
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

