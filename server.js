//Importar o módulo express

const express = require('express')();

//Importar o http e atribuir o express como parametro e criar um servidor
const http = require('http').createServer(express);

//Importar o socket.io colocando o http como parametro
const io = require('socket.io')(http);

//chamando a pasta public
const express2 = require('express');
express.use(express2.static('public'));

//Iniciar o servidor na porta 3000
http.listen(3000, () => {
    console.log(`Servidor rodando na porta 3000 - Link http://localhost:3000`)
})
var usuarios = []; // Lista de usuários
var ultimas_mensagens = []; // Lista com ultimas mensagens enviadas no chat

//Rota para página inicial
express.get('/' , (req, res) => res.sendFile(__dirname + '/public/index.html'));

io.on("connection", function(socket){
	// Método de resposta ao evento de entrar
	socket.on("entrar", function(apelido, callback){
		if(!(apelido in usuarios)){
			socket.apelido = apelido;
			usuarios[apelido] = socket; // Adicionadno o nome de usuário a lista armazenada no servidor

			// Enviar para o usuário ingressante as ultimas mensagens armazenadas.
			for(indice in ultimas_mensagens){
				socket.emit("atualizar mensagens", ultimas_mensagens[indice]);
			}


			var mensagem = "➡ " + apelido + " acabou de aterrissar no servidor " + " às " + pegarDataAtual();
			var obj_mensagem = {msg: mensagem, tipo: 'sistema'};

			io.sockets.emit("atualizar usuarios", Object.keys(usuarios)); // Enviando a nova lista de usuários
			io.sockets.emit("atualizar mensagens", obj_mensagem); // Enviando mensagem anunciando entrada do novo usuário

			armazenaMensagem(obj_mensagem); // Guardando a mensagem na lista de histórico

			callback(true);
		}else{
			callback(false);
		}
	});


	socket.on("enviar mensagem", function(dados, callback){

		var mensagem_enviada = dados.msg;
		var usuario = dados.usu;

		if(usuario == null)
			usuario = ''; // Caso não tenha um usuário, a mensagem será enviada para todos da sala

		mensagem_enviada = socket.apelido + " " + pegarDataAtual() + " - " + mensagem_enviada;
		var obj_mensagem = {msg: mensagem_enviada, tipo: ''};

		if(usuario == ''){
			io.sockets.emit("atualizar mensagens", obj_mensagem);
			armazenaMensagem(obj_mensagem); // Armazenando a mensagem
		}else{
			obj_mensagem.tipo = 'privada';
			socket.emit("atualizar mensagens", obj_mensagem); // Emitindo a mensagem para o usuário que a enviou
			usuarios[usuario].emit("atualizar mensagens", obj_mensagem); // Emitindo a mensagem para o usuário escolhido
		}
		
		callback();
	});

	socket.on("disconnect", function(){
		delete usuarios[socket.apelido];
		var mensagem = " ✖ " + socket.apelido + " saiu do chat" + " " + pegarDataAtual();
		var obj_mensagem = {msg: mensagem, tipo: 'sistema'};


		// No caso da saída de um usuário, a lista de usuários é atualizada
		// junto de um aviso em mensagem para os participantes da sala		
		io.sockets.emit("atualizar usuarios", Object.keys(usuarios));
		io.sockets.emit("atualizar mensagens", obj_mensagem);

		armazenaMensagem(obj_mensagem);
	});

});


// Função para apresentar uma String com a data e hora em formato DD/MM/AAAA HH:MM:SS
function pegarDataAtual(){
	var dataAtual = new Date();
	var dia = (dataAtual.getDate()<10 ? '0' : '') + dataAtual.getDate();
	var mes = ((dataAtual.getMonth() + 1)<10 ? '0' : '') + (dataAtual.getMonth() + 1);
	var ano = dataAtual.getFullYear();
	var hora = (dataAtual.getHours()<10 ? '0' : '') + dataAtual.getHours();
	var minuto = (dataAtual.getMinutes()<10 ? '0' : '') + dataAtual.getMinutes();

	var dataFormatada = dia + "/" + mes + "/" + ano + " às " + hora + ":" + minuto ;
	return dataFormatada;
}

// Função para guardar as mensagens e seu tipo na variável de ultimas mensagens
function armazenaMensagem(mensagem){
	if(ultimas_mensagens.length > 5){
		ultimas_mensagens.shift();
	}

	ultimas_mensagens.push(mensagem);
}