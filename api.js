const express = require('express');
const app = express();
const PORT = 8080;

// Versão da API
const VERSAO_API = "1.0.0";

// Perguntas do quiz
const perguntas = [
    {
        pergunta: "Qual é o índice do último elemento de uma lista chamada 'lista'?",
        resposta: "len(lista) - 1",
        alternativas: [
            "len(lista) - 1",
            "len(lista)",
            "-1",
            "lista[-0]"
        ]
    },
    {
        pergunta: "Como você remove todos os elementos de uma lista em Python?",
        resposta: "lista.clear()",
        alternativas: [
            "lista.clear()",
            "lista.remove()",
            "lista.delete_all()",
            "del lista"
        ]
    },
    {
        pergunta: "Qual função retorna uma nova lista ordenada sem modificar a lista original?",
        resposta: "sorted(lista)",
        alternativas: [
            "lista.sort()",
            "sort(lista)",
            "sorted(lista)",
            "lista.order()"
        ]
    },
    {
        pergunta: "Qual método retorna o índice de um elemento específico em uma lista?",
        resposta: "index()",
        alternativas: [
            "index()",
            "find()",
            "locate()",
            "search()"
        ]
    },
    {
        pergunta: "Qual método adiciona todos os elementos de outra lista ao final da lista atual?",
        resposta: "extend()",
        alternativas: [
            "append()",
            "extend()",
            "concat()",
            "insert()"
        ]
    },
    {
        pergunta: "Como você criaria uma cópia rasa de uma lista em Python?",
        resposta: "lista.copy()",
        alternativas: [
            "lista.copy()",
            "list(lista)",
            "lista[:] ",
            "copy(lista)"
        ]
    },
    {
        pergunta: "Qual sintaxe cria uma lista com elementos de 0 a 9?",
        resposta: "list(range(10))",
        alternativas: [
            "list(range(10))",
            "[0:10]",
            "list(0, 10)",
            "range(0, 9)"
        ]
    },
    {
        pergunta: "Qual método você usaria para adicionar um elemento em uma posição específica de uma lista?",
        resposta: "insert()",
        alternativas: [
            "insert()",
            "add()",
            "append()",
            "push()"
        ]
    },
    {
        pergunta: "Qual expressão cria uma lista de números pares de 0 a 10 usando list comprehension?",
        resposta: "[x for x in range(11) if x % 2 == 0]",
        alternativas: [
            "[x for x in range(11) if x % 2 == 0]",
            "[x for x in range(10) if x % 2 == 0]",
            "[x*2 for x in range(6)]",
            "[x for x in range(1, 10, 2)]"
        ]
    },
    {
        pergunta: "O que faz o comando 'lista.reverse()'?",
        resposta: "Inverte a ordem dos elementos na lista.",
        alternativas: [
            "Inverte a ordem dos elementos na lista.",
            "Ordena a lista em ordem decrescente.",
            "Remove o último elemento da lista.",
            "Adiciona um elemento ao início da lista."
        ]
    },
    {
        pergunta: "O que é uma lista em Python?",
        resposta: "Uma coleção ordenada e mutável de itens.",
        alternativas: [
            "Uma coleção ordenada e imutável de itens.",
            "Uma coleção desordenada de itens.",
            "Uma coleção ordenada e mutável de itens.",
            "Uma coleção de dados complexos apenas."
        ]
    },
    {
        pergunta: "Como acessar o primeiro elemento de uma lista chamada 'lista'?",
        resposta: "lista[0]",
        alternativas: [
            "lista[1]",
            "lista[0]",
            "lista[-1]",
            "lista.first()"
        ]
    },
    {
        pergunta: "Qual método adiciona um elemento ao final de uma lista?",
        resposta: "append()",
        alternativas: [
            "add()",
            "append()",
            "insert()",
            "extend()"
        ]
    },
    {
        pergunta: "Qual método remove o primeiro item com um valor específico de uma lista?",
        resposta: "remove()",
        alternativas: [
            "pop()",
            "remove()",
            "delete()",
            "clear()"
        ]
    },
    {
        pergunta: "Como obter a quantidade de elementos de uma lista?",
        resposta: "len()",
        alternativas: [
            "size()",
            "length()",
            "len()",
            "count()"
        ]
    },
    {
        pergunta: "O que o comando 'lista.pop()' faz?",
        resposta: "Remove e retorna o último elemento da lista.",
        alternativas: [
            "Remove o primeiro elemento da lista.",
            "Remove e retorna o último elemento da lista.",
            "Adiciona um elemento ao final da lista.",
            "Ordena a lista em ordem crescente."
        ]
    },
    {
        pergunta: "Qual desses métodos retorna a quantidade de vezes que um elemento aparece na lista?",
        resposta: "count()",
        alternativas: [
            "count()",
            "len()",
            "index()",
            "insert()"
        ]
    },
    {
        pergunta: "Como você ordenaria uma lista chamada 'lista' em ordem crescente?",
        resposta: "lista.sort()",
        alternativas: [
            "lista.sort()",
            "sorted(lista)",
            "lista.order()",
            "sort(lista)"
        ]
    },
    {
        pergunta: "O que acontece se você tentar acessar um índice que não existe em uma lista?",
        resposta: "Gera um erro IndexError",
        alternativas: [
            "Nada acontece.",
            "O índice é automaticamente ajustado.",
            "Gera um erro IndexError",
            "A lista é estendida automaticamente."
        ]
    },
    {
        pergunta: "Como podemos criar uma lista com os quadrados de 1 a 5 usando list comprehension?",
        resposta: "[x**2 for x in range(1, 6)]",
        alternativas: [
            "[x**2 for x in range(1, 5)]",
            "[x**2 for x in range(5)]",
            "[x**2 for x in range(1, 6)]",
            "range(1, 6)**2"
        ]
    },
    {
        pergunta: "Qual função retorna o maior número em uma lista?",
        resposta: "max()",
        alternativas: [
            "min()",
            "max()",
            "highest()",
            "top()"
        ]
    },
    {
        pergunta: "Qual expressão cria uma lista de strings com a palavra 'Python' repetida 5 vezes?",
        resposta: "['Python'] * 5",
        alternativas: [
            "['Python'] * 5",
            "['Python'] + 5",
            "['Python' * 5]",
            "repeat('Python', 5)"
        ]
    },
    {
        pergunta: "O que faz o comando 'lista[::2]'?",
        resposta: "Cria uma nova lista com elementos de índice par.",
        alternativas: [
            "Cria uma nova lista com elementos de índice par.",
            "Cria uma nova lista com elementos de índice ímpar.",
            "Reverte a ordem dos elementos na lista.",
            "Cria uma cópia da lista."
        ]
    },
    {
        pergunta: "Como você removeria um item específico de uma lista com base no índice?",
        resposta: "del lista[indice]",
        alternativas: [
            "del lista[indice]",
            "lista.remove(indice)",
            "lista.pop(indice)",
            "lista.delete(indice)"
        ]
    },
    {
        pergunta: "Como você verificaria se um item existe em uma lista?",
        resposta: "'item' in lista",
        alternativas: [
            "'item' in lista",
            "lista.contains('item')",
            "item in lista",
            "check('item', lista)"
        ]
    }
];

// Endpoint para retornar a versão da API
app.get('/version', (req, res) => {
    res.status(200).json({ version: VERSAO_API });
});

// Endpoint para retornar uma pergunta aleatória
app.get('/pergunta', (req, res) => {
    const perguntaAleatoria = perguntas[Math.floor(Math.random() * perguntas.length)];
    res.status(200).json(perguntaAleatoria);
});

// Endpoint para validar a versão da API e retornar uma resposta caso não corresponda
app.get('/validate-version/:version', (req, res) => {
    const userVersion = req.params.version;
    if (userVersion !== VERSAO_API) {
        return res.status(426).json({
            message: `Versão desatualizada! Atualize para a versão ${VERSAO_API} para acessar o quiz.`
        });
    }
    res.status(200).json({
        message: "Versão compatível. Você pode acessar o quiz.",
        version: VERSAO_API
    });
});

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
