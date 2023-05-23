//importar a binlioteca json-server
const jsonServer = require('json-server');

//criar uma instancia do servidor JsonServer
const server = jsonServer.create();

//criar um roteador com o arquivo db.json o roteador define as rotas
const router = jsonServer.router('db.json');

//função que são executadas em cada requisição feita com o servidor importa os padrões JSONSERVER 
const requisicao = jsonServer.defaults();

//funcao que são executadas em cada requisição 
server.use(requisicao);

//Define a porta 
const porta = 300;

//usa o roteador criado
server.use(router);

//importa o modulo express (não esqueça de instalar)
const express = express();

//configura o servidor para usar na pasta public
express.use(express.static('public'));

//Define a rota principal enviando o arquivo index.html
express.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
})

//inicia o servidor na porta definida e exibe mensagem
server.listen(porta, () => {
    console.log(`JSOOON SERVER está rodando em http://localhost:${porta}`);
})