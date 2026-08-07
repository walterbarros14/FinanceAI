console.log("Arquivo scripts.js carregado com sucesso!");

let historicoGastos = [];
let usuarioLogado = ""; 

const promptPuter = `
Leia a imagem da nota fiscal enviada.

Analise a imagem REAL enviada pelo usuário.

Extraia exclusivamente as informações encontradas nessa imagem.

Não invente dados.

Não utilize exemplos.

Não responda com "Supermercado Exemplo".

Não crie produtos fictícios.

Se não conseguir ler algum campo utilize null.

Retorne APENAS um JSON válido neste formato:

{
  "estabelecimento":"",
  "data":"",
  "valor":0,
  "categoriaEmoji":"",
  "produtos":[
    {
      "descricao":"",
      "quantidade":1,
      "valorUnitario":0,
      "subtotal":0
    }
  ]
}
`;

document.addEventListener("DOMContentLoaded", () => {
    const inputFoto = document.querySelector('.foto');
    const btnEntrar = document.getElementById('btn-entrar');
    const btnSair = document.getElementById('btn-sair');

    if (inputFoto) {
        inputFoto.addEventListener('change', lerfoto);
    }

    if (btnEntrar) {
        btnEntrar.addEventListener('click', realizarLoginOuCadastro);
    }

    if (btnSair) {
        btnSair.addEventListener('click', deslogar);
    }
    
    console.log("Sistema de autenticação por senha pronto!");
});

function realizarLoginOuCadastro() {
    const nomeInput = document.getElementById('input-usuario').value.trim();
    const senhaInput = document.getElementById('input-senha').value.trim();

    if (!nomeInput || !senhaInput) {
        exibirMensagem("Digite o nome e a senha!", "#e74c3c");
        return;
    }

    const senhaSalva = localStorage.getItem(`senha_user_${nomeInput.toLowerCase()}`);

    if (!senhaSalva) {
        localStorage.setItem(`senha_user_${nomeInput.toLowerCase()}`, AppCriptoSimples(senhaInput));
        usuarioLogado = nomeInput;
        exibirMensagem("Cadastro criado com sucesso! Entrando...", "#2ecc71");
        setTimeout(liberarAcessoApp, 1000);
    } else {
        if (senhaSalva === AppCriptoSimples(senhaInput)) {
            usuarioLogado = nomeInput;
            exibirMensagem("Login efetuado! Carregando dados...", "#2ecc71");
            setTimeout(liberarAcessoApp, 1000);
        } else {
            exibirMensagem("Senha incorreta para este usuário!", "#e74c3c");
        }
    }
}

function AppCriptoSimples(texto) {
    return btoa(texto);
}

function liberarAcessoApp() {
    document.getElementById('caixa-login').style.display = 'none';
    document.getElementById('conteudo-app').style.display = 'block';
    document.getElementById('nome-perfil').innerText = usuarioLogado;
    
    document.getElementById('input-senha').value = "";
    
    carregarGastosDoNavegador();
}

function deslogar() {
    usuarioLogado = "";
    historicoGastos = [];
    
    document.getElementById('input-usuario').value = "";
    document.getElementById('input-senha').value = "";
    
    document.getElementById('conteudo-app').style.display = 'none';
    document.getElementById('caixa-login').style.display = 'block';
    document.getElementById('mensagem-login').style.display = 'none';
    
    const inputFoto = document.querySelector('.foto');
    if (inputFoto) inputFoto.value = "";
    
    console.log("Sessão encerrada.");
}

function carregarGastosDoNavegador() {
    const dadosSalvos = localStorage.getItem(`gastos_user_${usuarioLogado.toLowerCase()}`);
    if (dadosSalvos) {
        historicoGastos = JSON.parse(dadosSalvos);
    } else {
        historicoGastos = [];
    }
    atualizarTela();
}

function salvarGastosNoNavegador() {
    localStorage.setItem(`gastos_user_${usuarioLogado.toLowerCase()}`, JSON.stringify(historicoGastos));
}

function exibirMensagem(texto, color) {
    const msg = document.getElementById('mensagem-login');
    if (msg) {
        msg.innerText = texto;
        msg.style.color = color;
        msg.style.display = 'block';
    }
}

async function lerfoto() {

    const inputFoto = document.querySelector(".foto");

    if (!inputFoto || inputFoto.files.length === 0) {
        alert("Selecione uma imagem.");
        return;
    }

    document.getElementById("qtd-comprovantes").innerText =
        "Processando imagem...";

    try {

        const arquivoImagem = inputFoto.files[0];

console.log("Imagem selecionada:", arquivoImagem);

const resposta = await puter.ai.chat(
    promptPuter,
    arquivoImagem,
    {
        model: "gpt-5.4-nano",
        temperature: 0
    }
);

console.log("Resposta completa:", resposta);
        console.log(resposta);
        console.dir(resposta);
        console.log("===================================");

        //-----------------------------------------------------
        // DESCOBRE ONDE ESTÁ O TEXTO DA IA
        //-----------------------------------------------------

        let texto = "";

        if (typeof resposta === "string") {

            texto = resposta;

        } else if (resposta?.message?.content) {

            texto = resposta.message.content;

        } else if (resposta?.content) {

            texto = resposta.content;

        } else if (resposta?.text) {

            texto = resposta.text;

        } else {

            texto = JSON.stringify(resposta);

        }

        console.log("Texto recebido:");
        console.log(texto);

        //-----------------------------------------------------
        // REMOVE ```json
        //-----------------------------------------------------

        texto = texto
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        //-----------------------------------------------------
        // PEGA SOMENTE O JSON
        //-----------------------------------------------------

        const inicio = texto.indexOf("{");
        const fim = texto.lastIndexOf("}");

        if (inicio === -1 || fim === -1) {
            throw new Error("A IA não retornou um JSON.");
        }

        texto = texto.substring(inicio, fim + 1);

        console.log("JSON LIMPO:");
        console.log(texto);

        const dadosGasto = JSON.parse(texto);
console.log("========== DADOS EXTRAÍDOS ==========");
console.log(dadosGasto);
console.table(dadosGasto.produtos || []);
console.log("=====================================");
        console.log("Objeto convertido:");
        console.log(dadosGasto);

//-----------------------------------------------------
// TRATAMENTO DO VALOR (MUITO MAIS SEGURO)
//-----------------------------------------------------

let valor =
    dadosGasto.valor ??
    dadosGasto.total ??
    dadosGasto.totalFinal ??
    dadosGasto.valorTotal ??
    dadosGasto.amount ??
    0;

if (typeof valor === "string") {

    valor = valor
        .replace(/R\$/gi, "")
        .replace(/\./g, "")
        .replace(",", ".")
        .replace(/\s/g, "")
        .trim();

}

valor = parseFloat(valor);

if (isNaN(valor)) {

    console.warn("Valor inválido recebido da IA.");

    valor = 0;

}

dadosGasto.valor = Number(valor.toFixed(2));

console.log("Valor confirmado:", dadosGasto.valor);

        console.log("VALOR FINAL:", dadosGasto.valor);

        historicoGastos.push(dadosGasto);

        salvarGastosNoNavegador();

        atualizarTela();

    } catch (erro) {

        console.error(erro);

        alert("Erro ao analisar a nota.");

    }

    inputFoto.value = "";

}



function atualizarTela() {

    let valorTotalAcumulado = 0;
    let htmlLista = "";

    historicoGastos.forEach(gasto => {

        console.log("Somando comprovante:", gasto.estabelecimento, gasto.valor);

valorTotalAcumulado += Number(gasto.valor) || 0;

        let valorFormatado =
            Number(gasto.valor).toLocaleString(
                'pt-BR',
                {
                    style: 'currency',
                    currency: 'BRL'
                }
            );

        //--------------------------------------------------
        // MONTA A LISTA DE PRODUTOS
        //--------------------------------------------------

        let produtosHTML = "";

        if (gasto.produtos && gasto.produtos.length > 0) {

            produtosHTML += `
                <div style="
                    margin-top:10px;
                    padding-top:10px;
                    border-top:1px solid #ddd;
                ">
            `;

            gasto.produtos.forEach(produto => {

                produtosHTML += `

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        margin-bottom:6px;
                        font-size:13px;
                    ">

                        <div>

                            <strong>${produto.descricao}</strong><br>

                            Qtd:
                            ${produto.quantidade ?? "-"}

                        </div>

                        <div style="text-align:right">

                            ${Number(produto.subtotal || 0).toLocaleString(
                                'pt-BR',
                                {
                                    style:'currency',
                                    currency:'BRL'
                                }
                            )}

                        </div>

                    </div>

                `;

            });

            produtosHTML += "</div>";

        }

        htmlLista += `

            <div class="item-gasto"
            style="
                background:white;
                border-radius:10px;
                padding:15px;
                margin-bottom:15px;
                text-align:left;
                box-shadow:0 2px 8px rgba(0,0,0,.08);
            ">

                <h3 style="margin:0;">
                    ${gasto.categoriaEmoji}
                    ${gasto.estabelecimento}
                </h3>

                <small>

                    ${gasto.data}

                </small>

                <h2 style="
                    color:#27ae60;
                    margin:10px 0;
                ">

                    ${valorFormatado}

                </h2>

                ${produtosHTML}

            </div>

        `;

    });

    document.getElementById("valor-total").innerText =
        valorTotalAcumulado.toLocaleString(
            'pt-BR',
            {
                style:'currency',
                currency:'BRL'
            }
        );

    document.getElementById("qtd-comprovantes").innerText =
        historicoGastos.length + " comprovante(s)";

    document.getElementById("lista-gastos").innerHTML =
        htmlLista;

}